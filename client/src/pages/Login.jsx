import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import styles from './Login.module.css';

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // 调用父组件传入的登录处理方法
      const success = await onLogin(values);
      
      if (success) {
        message.success('登录成功！');
        
        // 获取来源路径或默认首页
        const targetPath = location.state?.from?.pathname || '/books';
        navigate(targetPath, { replace: true });  // 替换当前历史记录
      }
    } catch (err) {
      message.error(`登录失败: ${err.message || '用户名或密码错误'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h2 className={styles.loginTitle}>图书馆管理系统</h2>
        <p className={styles.loginSubtitle}>请登录您的管理员账户</p>
        
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={handleSubmit}
          className={styles.loginForm}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名" 
              size="large"
              autoFocus
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="密码" 
              size="large"
            />
          </Form.Item>
          
          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>记住我</Checkbox>
            </Form.Item>
            <a className={styles.forgotLink} href="#">
              忘记密码?
            </a>
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
              block
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
      
      <div className={styles.footer}>
        © 2025 图书馆管理系统 版权所有
      </div>
    </div>
  );
};

export default Login;