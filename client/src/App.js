import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'; // 添加 useNavigate
import { Layout, Spin } from 'antd';
import Books from './pages/Books';
import Borrow from './pages/Borrow';
import Readers from './pages/Readers';
import Fines from './pages/Fines';
import Header from './components/Header';
import { getBooks } from './api/libraryApi';
import './index.css';

const { Content } = Layout;

// 创建导航上下文组件
function NavigationWrapper({ children }) {
  const navigate = useNavigate();
  return React.cloneElement(children, { navigate });
}

function App() {
  const [loading, setLoading] = useState(true);
  const [bookList, setBookList] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const books = await getBooks();
        setBookList(books);
      } catch (err) {
        console.error('数据加载失败', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <Spin size="large" tip="数据加载中..." className="app-loading" />;
  }

  return (
    <Router>
      <Layout className="app-layout">
        {/* 添加导航上下文 */}
        <NavigationWrapper>
          <Header />
        </NavigationWrapper>
        <Content className="app-content">
          <Routes>
            <Route path="/books" element={<Books bookList={bookList} />} />
            <Route path="/borrow" element={<Borrow />} />
            <Route path="/readers" element={<Readers />} />
            <Route path="/fines" element={<Fines />} />
            <Route path="/" element={<Books bookList={bookList} />} />
            <Route path="*" element={<Books bookList={bookList} />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;