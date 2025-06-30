import React, { useState, useEffect } from 'react';
import { Row, Col, Input, Button, Spin, Modal, Form, Select } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import BookCard from '../components/BookCard';
import { getBooks, addBook } from '../api/libraryApi';
import styles from './Books.module.css';

const { Option } = Select;

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [publishers, setPublishers] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadBooks();
    loadPublishers();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await getBooks();
      setBooks(data);
    } catch (err) {
      console.error('加载失败', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPublishers = async () => {
    setPublishers([
      { PubID: 1, Name: '人民文学出版社' },
      { PubID: 2, Name: '商务印书馆' },
      { PubID: 3, Name: '清华大学出版社' }
    ]);
  };

  // 修复1：确保借阅按钮有实际响应
  const handleBorrow = (bookId) => {
    console.log('借阅图书ID:', bookId);
    // 实际项目中应调用借书API
    // borrowBook(bookId).then(() => {
    //   message.success('借阅成功');
    // });
    
    // 添加临时响应效果
    alert(`借阅图书ID: ${bookId}`);
  };

  // 修复2：确保添加新书按钮触发模态框
  const showAddModal = () => setIsModalVisible(true);

  const handleAddBook = async (values) => {
    try {
      await addBook(values);
      loadBooks(); // 刷新图书列表
      setIsModalVisible(false);
      form.resetFields();
      // 实际项目中添加成功提示
      // message.success('添加成功');
    } catch (err) {
      console.error('添加失败', err);
      // 实际项目中添加错误提示
      // message.error('添加失败');
    }
  };

  const filteredBooks = books.filter(book => 
    book.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.ISBN.includes(searchTerm) ||
    book.Publisher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Input
          placeholder="搜索图书名称、ISBN或出版社..."
          prefix={<SearchOutlined />}
          onChange={e => setSearchTerm(e.target.value)}
          className={styles.search}
        />
        {/* 修复3：直接绑定showAddModal函数 */}
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={showAddModal}
        >
          添加新书
        </Button>
      </div>

      {loading ? (
        <Spin size="large" className={styles.spinner} />
      ) : (
        <Row gutter={[24, 24]} className={styles.bookGrid}>
          {filteredBooks.map(book => (
            <Col key={book.BookID} xs={24} sm={12} md={8} lg={6}>
              {/* 修复4：确保传递正确的handleBorrow函数 */}
              <BookCard 
                book={book} 
                onBorrow={() => handleBorrow(book.BookID)}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* 添加新书模态框 */}
      <Modal
        title="添加新书"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleAddBook}>
          <Form.Item
            label="书名"
            name="Title"
            rules={[{ required: true, message: '请输入书名' }]}
          >
            <Input placeholder="请输入书名" />
          </Form.Item>
          
          <Form.Item
            label="ISBN"
            name="ISBN"
            rules={[{ required: true, message: '请输入ISBN号' }]}
          >
            <Input placeholder="请输入ISBN号" />
          </Form.Item>
          
          <Form.Item
            label="出版社"
            name="PubID"
            rules={[{ required: true, message: '请选择出版社' }]}
          >
            <Select placeholder="请选择出版社">
              {publishers.map(pub => (
                <Option key={pub.PubID} value={pub.PubID}>
                  {pub.Name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            label="封面URL"
            name="CoverURL"
          >
            <Input placeholder="请输入封面图片URL" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Books;