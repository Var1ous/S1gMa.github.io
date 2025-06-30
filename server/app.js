require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
// app.js 关键修改
//const authRouter = require('./routes/auth'); // 导入路由实例
//const authenticate = authRouter.authenticate; // 提取中间件

//app.use('/api/auth', authRouter); // ✅ 正确：传入路由实例
app.use('/api/books', require('./routes/books'));
app.use('/api/borrow', require('./routes/borrow'));
app.use('/api/readers', require('./routes/readers'));
app.use('/api/fines', require('./routes/fines'));


// 错误处理
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('❌ 服务器错误');
});

// 启动服务
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => 
    console.log(`🚀 服务已启动: http://localhost:${PORT}`)
);