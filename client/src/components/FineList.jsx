import React from 'react';
import { Table, Tag, Button, Popconfirm, message } from 'antd';
import { payFine } from '../api/libraryApi';
import styles from './FineList.module.css';

const FineList = ({ fines, onPaySuccess }) => {
  // 处理支付罚款操作
  const handlePay = async (fineId) => {
    try {
      await payFine(fineId);
      message.success('罚款支付成功');
      onPaySuccess(fineId); // 通知父组件更新状态
    } catch (err) {
      message.error(`支付失败: ${err.message}`);
    }
  };

  // 表格列配置
  const columns = [
    {
      title: '图书信息',
      dataIndex: 'bookTitle',
      key: 'bookTitle',
      render: (text) => <span className={styles.bookTitle}>{text}</span>
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `¥${amount.toFixed(2)}`,
      align: 'right'
    },
    {
      title: '逾期天数',
      dataIndex: 'overdueDays',
      key: 'overdueDays',
      render: (days) => <Tag color={days > 15 ? 'red' : 'orange'}>{days}天</Tag>
    },
    {
      title: '状态',
      dataIndex: 'paidStatus',
      key: 'status',
      render: (status) => (
        <Tag color={status ? 'green' : 'volcano'}>
          {status ? '已支付' : '未支付'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        !record.paidStatus && (
          <Popconfirm
            title="确认支付此罚款？"
            onConfirm={() => handlePay(record.fineId)}
          >
            <Button type="primary" size="small">
              支付
            </Button>
          </Popconfirm>
        )
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={fines}
      rowKey="fineId"
      pagination={{ pageSize: 8 }}
      className={styles.table}
      rowClassName={(record) => record.paidStatus ? styles.paidRow : ''}
    />
  );
};

export default FineList;