import React from 'react';
import { Menu } from 'antd';
import { 
  BookOutlined, 
  SolutionOutlined, 
  UserOutlined, 
  MoneyCollectOutlined 
} from '@ant-design/icons';

const Header = ({ navigate }) => { // 接收 navigate 参数
  const menuItems = [
    {
      key: 'books',
      label: '图书管理',
      icon: <BookOutlined />,
      onClick: () => navigate('/books') // 正确绑定点击事件
    },
    {
      key: 'borrow',
      label: '借阅管理',
      icon: <SolutionOutlined />,
      onClick: () => navigate('/borrow')
    },
    {
      key: 'readers',
      label: '读者管理',
      icon: <UserOutlined />,
      onClick: () => navigate('/readers')
    },
    {
      key: 'fines',
      label: '罚款管理',
      icon: <MoneyCollectOutlined />,
      onClick: () => navigate('/fines')
    }
  ];

  return (
    <Menu 
      mode="horizontal" 
      theme="dark" 
      items={menuItems} 
      selectedKeys={[]} 
    />
  );
};

export default Header;