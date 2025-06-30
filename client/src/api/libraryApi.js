import axios from 'axios';
import { message } from 'antd';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000
});


// 响应拦截器（统一错误处理）
API.interceptors.response.use(
  response => response.data,
  error => {
    const errMsg = error.response?.data?.message || error.message;
    message.error(`请求失败: ${errMsg}`);
    return Promise.reject(error);
  }
);

// 图书接口
export const getBooks = () => API.get('/books');
export const addBook = book => API.post('/books', book);

// 读者接口
export const getReaders = (page = 1, limit = 10) => 
  API.get(`/readers?page=${page}&limit=${limit}`);

export const addReader = reader => API.post('/readers', reader);

// 借阅接口
export const borrowBook = data => API.post('/borrow', data);
export const returnBook = recordId => API.put(`/borrow/return/${recordId}`);

export const getFines = (readerId) => 
  API.get('/fines', { params: { readerId } }); // 使用查询参数

export const payFine = (fineId) => 
  API.put(`/fines/${fineId}/pay`); // 标准路径参数
// 认证接口
export const login = credentials => API.post('/auth/login', credentials);