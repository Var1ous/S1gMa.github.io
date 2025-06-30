import React from 'react';
import { Card, Tag, Button, Tooltip } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import styles from './BookCard.module.css';

const BookCard = ({ book, onBorrow }) => (
  <Card
    hoverable
    cover={
      book.CoverURL ? 
        <img alt={book.Title} src={book.CoverURL} className={styles.cover} /> :
        <div className={styles.coverPlaceholder}>无封面</div>
    }
    className={styles.card}
  >
    <div className={styles.content}>
      <h3 className={styles.title}>{book.Title}</h3>
      <p className={styles.isbn}>ISBN: {book.ISBN}</p>
      <p className={styles.publisher}>出版社: {book.Publisher}</p>
      
      {book.Categories && (
        <div className={styles.tags}>
          {book.Categories.split(', ').map((tag, index) => (
            <Tag key={index} color="blue">{tag}</Tag>
          ))}
        </div>
      )}
      
      <Tooltip 
        title={book.CurrentQty > 0 ? 
          "可借阅" : 
          "库存不足，请等待归还"}
      >
        <Tag 
          color={book.CurrentQty > 0 ? "green" : "red"} 
          className={styles.stock}
        >
          库存: {book.CurrentQty}/{book.TotalQty}
        </Tag>
      </Tooltip>
    </div>
    
    <Button 
      type="primary" 
      icon={<ShoppingCartOutlined />}
      disabled={book.CurrentQty <= 0}
      onClick={() => onBorrow(book.BookID)}
      className={styles.borrowBtn}
    >
      借阅
    </Button>
  </Card>
);

export default BookCard;