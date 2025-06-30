import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Form, Pagination, Tag, message } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import { getReaders, addReader } from '../api/libraryApi';
import styles from './Readers.module.css';

const Readers = () => {
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [form] = Form.useForm();

  // 测试数据 - 包含中文和英文人名
  const TEST_DATA = [
    {
      ReaderID: 5,
      FirstName: "张",
      LastName: "伟",
      Email: "zhangwei@example.com",
      Phone: "NULL",
      RegDate: "2025-06-17 07:41:02.597"
    },
    {
      ReaderID: 6,
      FirstName: "李",
      LastName: "娜",
      Email: "lina@example.com",
      Phone: "NULL",
      RegDate: "2025-06-17 07:41:02.597"
    }
  ];

  // 加载读者数据
  const loadReaders = async (page = pagination.current, pageSize = pagination.pageSize) => {
    setLoading(true);
    try {
      // 开发环境使用测试数据，生产环境使用API
      if (process.env.NODE_ENV === 'development') {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 分页处理测试数据
        const startIndex = (page - 1) * pageSize;
        const paginatedData = TEST_DATA.slice(startIndex, startIndex + pageSize);
        
        setReaders(paginatedData);
        setPagination({
          ...pagination,
          total: TEST_DATA.length,
          current: page
        });
      } else {
        // 生产环境使用真实API
        const response = await getReaders(page, pageSize);
        setReaders(response.data.items || []);
        setPagination({
          ...pagination,
          total: response.data.total || 0,
          current: page
        });
      }
    } catch (err) {
      message.error(`数据加载失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReaders();
  }, []);

  // 添加读者
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (process.env.NODE_ENV === 'development') {
        // 开发环境模拟添加
        const newReader = {
          ReaderID: readers.length + 1,
          ...values,
          RegDate: new Date().toISOString()
        };
        setReaders([...readers, newReader]);
        message.success('读者添加成功（测试模式）');
      } else {
        // 生产环境使用真实API
        await addReader(values);
        message.success('读者添加成功');
      }
      
      setIsModalVisible(false);
      form.resetFields();
      loadReaders(pagination.current);
    } catch (err) {
      message.error(`添加失败: ${err.message}`);
    }
  };

  // 处理分页变化
  const handlePaginationChange = (page, pageSize) => {
    setPagination({ ...pagination, current: page, pageSize });
    loadReaders(page, pageSize);
  };

  // 搜索过滤
  const filteredReaders = readers.filter(reader => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (reader.FirstName && reader.FirstName.toLowerCase().includes(searchLower)) ||
      (reader.LastName && reader.LastName.toLowerCase().includes(searchLower)) ||
      (reader.Email && reader.Email.toLowerCase().includes(searchLower)) ||
      (reader.Phone && reader.Phone.includes(searchTerm))
    );
  });

  // 表格列配置
  const columns = [
    {
      title: '姓名',
      key: 'Name',
      render: (_, record) => `${record.FirstName || ''} ${record.LastName || ''}`.trim(),
    },
    {
      title: '邮箱',
      dataIndex: 'Email',
      key: 'Email',
    },
    {
      title: '电话',
      dataIndex: 'Phone',
      key: 'Phone',
    },
    {
      title: '注册日期',
      dataIndex: 'RegDate',
      key: 'RegDate',
      render: date => date ? new Date(date).toLocaleDateString() : 'N/A'
    },
    {
      title: '状态',
      key: 'status',
      render: () => <Tag color="green">正常</Tag>
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Input.Search
          placeholder="搜索读者姓名、邮箱或电话..."
          allowClear
          onChange={e => setSearchTerm(e.target.value)}
          className={styles.search}
          enterButton
        />
        <Button 
          type="primary" 
          icon={<UserAddOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          添加读者
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredReaders}
        loading={loading}
        rowKey={(record) => record.ReaderID}
        pagination={false}
        className={styles.table}
        locale={{ emptyText: "暂无读者数据" }}
      />
      
      <Pagination
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onChange={handlePaginationChange}
        className={styles.pagination}
        showSizeChanger
        pageSizeOptions={['5', '10', '20', '50']}
      />

      {/* 添加模态框 */}
      <Modal
        title="添加新读者"
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText="添加"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="姓氏"
            name="LastName"
            rules={[{ required: true, message: '请输入姓氏' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="名字"
            name="FirstName"
            rules={[{ required: true, message: '请输入名字' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="邮箱"
            name="Email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱格式' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="电话"
            name="Phone"
            rules={[{ required: true, message: '请输入电话' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Readers;