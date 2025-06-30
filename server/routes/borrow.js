const express = require('express');
const router = express.Router();
const sql = require('mssql');
const db = require('../config/db');

/**
 * 借阅图书
 * @route POST /api/borrow
 * @param {number} BookID.body.required - 图书ID
 * @param {number} ReaderID.body.required - 读者ID
 */
router.post('/', async (req, res) => {
    const { BookID, ReaderID } = req.body;
    try {
        // 检查库存
        const stockCheck = await db.request()
            .input('BookID', sql.Int, BookID)
            .query('SELECT CurrentQty FROM Book WHERE BookID = @BookID');
        
        if (stockCheck.recordset[0].CurrentQty <= 0) {
            return res.status(400).send('❌ 库存不足');
        }

        // 创建借阅记录
        const result = await db.request()
            .input('BookID', sql.Int, BookID)
            .input('ReaderID', sql.Int, ReaderID)
            .query(`
                INSERT INTO BorrowRecord (BookID, ReaderID)
                OUTPUT inserted.RecordID
                VALUES (@BookID, @ReaderID)
            `);
        
        res.status(201).json({ 
            recordId: result.recordset[0].RecordID,
            message: '✅ 借阅成功'
        });
    } catch (err) {
        res.status(500).send(`❌ 借阅失败: ${err.message}`);
    }
});

/**
 * 归还图书
 * @route PUT /api/borrow/return/:id
 * @param {number} id.path.required - 借阅记录ID
 */
router.put('/return/:id', async (req, res) => {
    const recordId = req.params.id;
    try {
        await db.request()
            .input('RecordID', sql.Int, recordId)
            .query(`
                UPDATE BorrowRecord 
                SET ReturnDate = GETDATE(), Status = 'RETURNED'
                WHERE RecordID = @RecordID
            `);
        res.send('✅ 归还成功');
    } catch (err) {
        res.status(500).send(`❌ 归还失败: ${err.message}`);
    }
});
module.exports = router;