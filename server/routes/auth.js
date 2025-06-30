const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// 管理员登录
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await db.request()
            .input('Username', sql.NVarChar, username)
            .query('SELECT * FROM Admin WHERE Username = @Username');

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: '❌ 用户不存在' }); // 统一JSON响应
        }

        const admin = result.recordset[0];
        const validPassword = await bcrypt.compare(password, admin.Password);
        if (!validPassword) {
            return res.status(401).json({ error: '❌ 密码错误' }); // 统一JSON响应
        }

        // 生成JWT（有效期2小时）
        const token = jwt.sign(
            { adminId: admin.AdminID },
            process.env.JWT_SECRET || 'library_secret_key',
            { expiresIn: '2h' }
        );

        // 更新最后登录时间
        await db.request()
            .input('AdminID', sql.Int, admin.AdminID)
            .query('UPDATE Admin SET LastLogin = GETDATE() WHERE AdminID = @AdminID');

        res.json({ token, adminId: admin.AdminID }); // 返回adminId方便前端使用
    } catch (err) {
        // 统一错误格式 + 记录日志
        console.error(`[${new Date().toISOString()}] 登录失败: ${err.message}`);
        res.status(500).json({ error: `❌ 登录失败: ${err.message}` });
    }
});

// JWT验证中间件
const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: '❌ 无访问令牌' }); // 统一JSON响应

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'library_secret_key');
        req.adminId = decoded.adminId;
        next();
    } catch (err) {
        // 细分令牌错误类型
        const message = err.name === 'TokenExpiredError' 
            ? '令牌已过期' 
            : '令牌无效';
        res.status(401).json({ error: `❌ ${message}` });
    }
};

// 关键修复：分别导出路由和中间件
module.exports = router; // 主导出路由实例
module.exports.authenticate = authenticate; // 附加导出中间件