import React, { useState } from 'react';
import { Form, Select, DatePicker, Button, message } from 'antd';
import { getReaders } from '../api/libraryApi';
import styles from './BorrowForm.module.css';

const BorrowForm = ({ books, onSubmit }) => {
  const [form] = Form.useForm();
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadReaders = async () => {
    setLoading(true);
    try {
      const response = await getReaders(1, 100);
      setReaders(response.data);
    } catch (err) {
      message.error('加载读者数据失败');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadReaders();
  }, []);

  const handleSubmit = (values) => {
    const selectedBook = books.find(b => b.BookID === values.bookId);
    onSubmit({
      ...values,
      bookTitle: selectedBook?.Title || '未知书籍'
    });
    form.resetFields();
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className={styles.form}
      >
        <Form.Item
          label="选择图书"
          name="bookId"
          rules={[{ required: true, message: '请选择图书' }]}
        >
          <Select 
            placeholder="请选择要借阅的图书"
            loading={loading}
            showSearch
            optionFilterProp="children"
          >
            {books.map(book => (
              <Select.Option key={book.BookID} value={book.BookID}>
                {book.Title} ({book.Author})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          label="选择读者"
          name="readerId"
          rules={[{ required: true, message: '请选择读者' }]}
        >
          <Select 
            placeholder="请选择借阅读者"
            loading={loading}
            showSearch
            optionFilterProp="children"
          >
            {readers.map(reader => (
              <Select.Option key={reader.ReaderID} value={reader.ReaderID}>
                {reader.FirstName} {reader.LastName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          label="借阅日期"
          name="borrowDate"
          rules={[{ required: true, message: '请选择借阅日期' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item
          label="应还日期"
          name="dueDate"
          rules={[{ required: true, message: '请选择应还日期' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        
        <Button 
          type="primary" 
          htmlType="submit"
          className={styles.submitBtn}
        >
          确认借阅
        </Button>
      </Form>
    </div>
  );
};

export default BorrowForm;