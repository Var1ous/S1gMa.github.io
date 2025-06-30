import React, { useState, useEffect } from 'react';
import { Select, Card, Spin, Empty } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import FineList from '../components/FineList';
import { getReaders, getFines } from '../api/libraryApi';
import styles from './Fines.module.css';

const { Option } = Select;

const Fines = () => {
  const [fines, setFines] = useState([]);
  const [readers, setReaders] = useState([]);
  const [selectedReader, setSelectedReader] = useState(null);
  const [statusFilter, setStatusFilter] = useState('unpaid');
  const [loading, setLoading] = useState(false);

  // 加载读者数据
  useEffect(() => {
    const loadReaders = async () => {
      try {
        const response = await getReaders(1, 100);
        setReaders(response.data);
      } catch (err) {
        console.error('加载读者失败', err);
      }
    };
    loadReaders();
  }, []);

  // 加载罚款数据
  useEffect(() => {
    if (!selectedReader) return;
    
    const loadFinesData = async () => {
      setLoading(true);
      try {
        const finesData = await getFines(selectedReader);
        setFines(finesData);
      } catch (err) {
        console.error('加载罚款失败', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadFinesData();
  }, [selectedReader]);

  // 处理支付成功后的状态更新
  const handlePaySuccess = (fineId) => {
    setFines(fines.map(fine => 
      fine.fineId === fineId ? { ...fine, paidStatus: true } : fine
    ));
  };

  // 应用状态筛选
  const filteredFines = fines.filter(fine => 
    statusFilter === 'all' || 
    (statusFilter === 'paid' && fine.paidStatus) ||
    (statusFilter === 'unpaid' && !fine.paidStatus)
  );

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <UserOutlined /> 罚款管理
      </h2>
      
      <Card className={styles.filterCard}>
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <span>选择读者：</span>
            <Select
              placeholder="请选择读者"
              onChange={setSelectedReader}
              className={styles.readerSelect}
              showSearch
              optionFilterProp="children"
            >
              {readers.map(reader => (
                <Option 
                  key={reader.ReaderID} 
                  value={reader.ReaderID}
                >
                  {reader.FirstName} {reader.LastName}
                </Option>
              ))}
            </Select>
          </div>
          
          <div className={styles.filterGroup}>
            <span>状态筛选：</span>
            <Select
              defaultValue="unpaid"
              onChange={setStatusFilter}
              className={styles.statusSelect}
            >
              <Option value="all">全部</Option>
              <Option value="paid">已支付</Option>
              <Option value="unpaid">未支付</Option>
            </Select>
          </div>
        </div>
      </Card>

      {loading ? (
        <Spin size="large" className={styles.spinner} />
      ) : selectedReader ? (
        filteredFines.length > 0 ? (
          <FineList 
            fines={filteredFines} 
            onPaySuccess={handlePaySuccess}
          />
        ) : (
          <Empty
            description={statusFilter === 'paid' ? 
              "该读者没有已支付罚款" : 
              "该读者没有未支付罚款"}
            className={styles.empty}
          />
        )
      ) : (
        <Empty
          description="请先选择读者查看罚款记录"
          className={styles.empty}
        />
      )}
    </div>
  );
};

export default Fines;