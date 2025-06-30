import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Popconfirm, message } from 'antd';
import { HistoryOutlined, CheckCircleOutlined } from '@ant-design/icons';
import BorrowForm from '../components/BorrowForm';
import { getBooks, getReaders } from '../api/libraryApi';
import styles from './Borrow.module.css';

const Borrow = () => {
  const [borrowRecords, setBorrowRecords] = useState([]);
  const [books, setBooks] = useState([]);
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(false);

  // 模拟借阅数据
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 实际项目中应从API获取
        const booksData = await getBooks();
        const readersData = await getReaders(1, 100);
        
        setBooks(booksData);
        setReaders(readersData.data);
        
        // 模拟借阅记录
        setBorrowRecords([
          {
            RecordID: 1,
            BookID: 1,
            ReaderID: 1,
            BorrowDate: '2025-06-01',
            DueDate: '2025-07-01',
            ReturnDate: null,
            Status: 'BORROWED',
            BookTitle: booksData[0]?.Title || '三体',
            ReaderName: '张伟'
          },
          {
            RecordID: 2,
            BookID: 2,
            ReaderID: 2,
            BorrowDate: '2025-05-20',
            DueDate: '2025-06-19',
            ReturnDate: null,
            Status: 'OVERDUE',
            BookTitle: booksData[1]?.Title || 'Node.js实战',
            ReaderName: '李娜'
          }
        ]);
      } catch (err) {
        console.error('加载失败', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleBorrow = (values) => {
    console.log('借阅信息:', values);
    message.success('借阅操作已提交');
    // 实际项目中应调用借书API
  };

  const handleReturn = (recordId) => {
    message.success(`归还记录ID: ${recordId}`);
    // 实际项目中应调用还书API
  };

  const columns = [
    {
      title: '图书信息',
      dataIndex: 'BookTitle',
      key: 'BookTitle',
    },
    {
      title: '借阅人',
      dataIndex: 'ReaderName',
      key: 'ReaderName',
    },
    {
      title: '借出日期',
      dataIndex: 'BorrowDate',
      key: 'BorrowDate',
    },
    {
      title: '应还日期',
      dataIndex: 'DueDate',
      key: 'DueDate',
      render: (text, record) => (
        <span className={record.Status === 'OVERDUE' ? styles.overdue : ''}>
          {text}
        </span>
      )
    },
    {
      title: '状态',
      dataIndex: 'Status',
      key: 'Status',
      render: status => {
        let color, text;
        switch(status) {
          case 'BORROWED':
            color = 'blue';
            text = '借阅中';
            break;
          case 'RETURNED':
            color = 'green';
            text = '已归还';
            break;
          case 'OVERDUE':
            color = 'red';
            text = '已逾期';
            break;
          default:
            color = 'gray';
        }
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        record.Status !== 'RETURNED' && (
          <Popconfirm
            title="确定归还此书吗？"
            onConfirm={() => handleReturn(record.RecordID)}
          >
            <Button 
              type="primary" 
              icon={<CheckCircleOutlined />}
              className={styles.returnBtn}
            >
              归还
            </Button>
          </Popconfirm>
        )
      )
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2><HistoryOutlined /> 借阅管理</h2>
        <BorrowForm 
          books={books}
          readers={readers}
          onBorrow={handleBorrow}
        />
      </div>

      <Table
        columns={columns}
        dataSource={borrowRecords}
        loading={loading}
        rowKey="RecordID"
        pagination={{ pageSize: 5 }}
        className={styles.table}
      />
    </div>
  );
};

export default Borrow;