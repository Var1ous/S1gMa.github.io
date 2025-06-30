const express = require('express');
const router = express.Router();
const sql = require('mssql');
const db = require('../config/db');

// 获取用户所有罚款记录
router.get('/:readerId', async (req, res) => {
    const readerId = req.params.readerId;
    try {
        const result = await db.request()
            .input('ReaderID', sql.Int, readerId)
            .query(`
                SELECT f.FineID, f.Amount, f.PaidStatus, b.Title, r.FirstName + ' ' + r.LastName AS ReaderName
                FROM Fine f
                JOIN BorrowRecord br ON f.RecordID = br.RecordID
                JOIN Book b ON br.BookID = b.BookID
                JOIN Reader r ON br.ReaderID = r.ReaderID
                WHERE r.ReaderID = @ReaderID
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(`❌ 查询失败: ${err.message}`);
    }
});

// 支付罚款
router.put('/pay/:fineId', async (req, res) => {
    const fineId = req.params.fineId;
    try {
        await db.request()
            .input('FineID', sql.Int, fineId)
            .query(`
                UPDATE Fine 
                SET PaidStatus = 1, PaidTime = GETDATE()
                WHERE FineID = @FineID
            `);
        res.send('✅ 支付成功');
    } catch (err) {
        res.status(500).send(`❌ 支付失败: ${err.message}`);
    }
});
module.exports = router;