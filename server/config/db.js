const sql = require('mssql');
const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123456',
    server: 'localhost',
    database: 'LibraryDB',
    options: {
        encrypt: true,
        trustServerCertificate: true
    },
    pool: { max: 10, min: 0 }
};
const pool = new sql.ConnectionPool(config);
pool.connect().then(() => console.log('✅ 数据库连接成功'));
module.exports = pool;