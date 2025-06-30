const express = require('express');
const router = express.Router();
const sql = require('mssql');
const db = require('../config/db');

/**
 * 获取所有读者（分页查询）
 * @route GET /api/readers
 * @param {number} page.query - 页码（默认1）
 * @param {number} limit.query - 每页数量（默认10）
 */
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        // 查询读者数据（分页）
        const result = await db.request()
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, limit)
            .query(`
                SELECT ReaderID, FirstName, LastName, Email, Phone, RegDate
                FROM Reader
                ORDER BY ReaderID DESC
                OFFSET @offset ROWS
                FETCH NEXT @limit ROWS ONLY
            `);

        // 查询总数
        const countResult = await db.request().query('SELECT COUNT(*) AS total FROM Reader');
        const total = countResult.recordset[0].total;

        res.json({
            data: result.recordset,
            pagination: { page, limit, total }
        });
    } catch (err) {
        res.status(500).send(`❌ 查询失败: ${err.message}`);
    }
});

/**
 * 添加新读者（邮箱唯一性验证）
 * @route POST /api/readers
 * @param {string} FirstName.body.required - 名
 * @param {string} LastName.body.required - 姓
 * @param {string} Email.body.required - 邮箱（唯一）
 */
router.post('/', async (req, res) => {
    const { FirstName, LastName, Email, Phone } = req.body;
    try {
        // 检查邮箱是否已存在
        const emailCheck = await db.request()
            .input('Email', sql.NVarChar, Email)
            .query('SELECT ReaderID FROM Reader WHERE Email = @Email');
        
        if (emailCheck.recordset.length > 0) {
            return res.status(400).send('❌ 邮箱已被注册');
        }

        // 插入新读者
        await db.request()
            .input('FirstName', sql.NVarChar, FirstName)
            .input('LastName', sql.NVarChar, LastName)
            .input('Email', sql.NVarChar, Email)
            .input('Phone', sql.NVarChar, Phone || '')
            .query(`
                INSERT INTO Reader (FirstName, LastName, Email, Phone)
                VALUES (@FirstName, @LastName, @Email, @Phone)
            `);

        res.status(201).send('✅ 读者添加成功');
    } catch (err) {
        res.status(500).send(`❌ 添加失败: ${err.message}`);
    }
});

/**
 * 更新读者信息
 * @route PUT /api/readers/:id
 * @param {number} id.path.required - 读者ID
 */
router.put('/:id', async (req, res) => {
    const readerId = req.params.id;
    const { FirstName, LastName, Phone } = req.body;
    
    try {
        await db.request()
            .input('ReaderID', sql.Int, readerId)
            .input('FirstName', sql.NVarChar, FirstName)
            .input('LastName', sql.NVarChar, LastName)
            .input('Phone', sql.NVarChar, Phone || '')
            .query(`
                UPDATE Reader
                SET FirstName = @FirstName,
                    LastName = @LastName,
                    Phone = @Phone
                WHERE ReaderID = @ReaderID
            `);
        res.send('✅ 读者信息更新成功');
    } catch (err) {
        res.status(500).send(`❌ 更新失败: ${err.message}`);
    }
});

/**
 * 删除读者（检查借阅记录）
 * @route DELETE /api/readers/:id
 * @param {number} id.path.required - 读者ID
 */
router.delete('/:id', async (req, res) => {
    const readerId = req.params.id;
    try {
        // 检查是否有未归还图书
        const borrowCheck = await db.request()
            .input('ReaderID', sql.Int, readerId)
            .query(`
                SELECT RecordID FROM BorrowRecord
                WHERE ReaderID = @ReaderID AND ReturnDate IS NULL
            `);
        
        if (borrowCheck.recordset.length > 0) {
            return res.status(400).send('❌ 该读者有未归还图书，不可删除');
        }

        // 执行删除
        await db.request()
            .input('ReaderID', sql.Int, readerId)
            .query('DELETE FROM Reader WHERE ReaderID = @ReaderID');
        
        res.send('✅ 读者删除成功');
    } catch (err) {
        res.status(500).send(`❌ 删除失败: ${err.message}`);
    }
});

module.exports = router;