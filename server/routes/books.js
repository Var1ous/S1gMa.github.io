const express = require('express');
const router = express.Router();
const sql = require('mssql');
const db = require('../config/db');

/**
 * 获取所有图书（含出版社和分类信息）
 * @route GET /api/books
 * @returns {Array} 200 - 图书列表
 */
router.get('/', async (req, res) => {
    try {
        const result = await db.request().query(`
            SELECT 
                b.BookID, b.Title, b.ISBN, b.CoverURL, 
                p.Name AS Publisher,
                STRING_AGG(c.Name, ', ') AS Categories
            FROM Book b
            JOIN Publisher p ON b.PubID = p.PubID
            LEFT JOIN BookCategory bc ON b.BookID = bc.BookID
            LEFT JOIN Category c ON bc.CatID = c.CatID
            GROUP BY b.BookID, b.Title, b.ISBN, b.CoverURL, p.Name
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(`❌ 查询失败: ${err.message}`);
    }
});

/**
 * 添加新书
 * @route POST /api/books
 * @param {string} Title.body.required - 书名
 * @param {string} ISBN.body.required - ISBN号
 * @param {number} PubID.body.required - 出版社ID
 */
router.post('/', async (req, res) => {
    const { Title, ISBN, PubID, CoverURL } = req.body;
    try {
        await db.request()
            .input('Title', sql.NVarChar, Title)
            .input('ISBN', sql.NVarChar, ISBN)
            .input('PubID', sql.Int, PubID)
            .input('CoverURL', sql.NVarChar, CoverURL || '')
            .query(`
                INSERT INTO Book (Title, ISBN, PubID, CoverURL)
                VALUES (@Title, @ISBN, @PubID, @CoverURL)
            `);
        res.status(201).send('✅ 图书添加成功');
    } catch (err) {
        res.status(500).send(`❌ 添加失败: ${err.message}`);
    }
});
module.exports = router;