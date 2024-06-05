import express from 'express';
import db from '../config/db.js';
const router = express.Router();
//Orders-----------------------------------------------------------------------------------------------------

// Fetch requested orders with supplier information
router.get('/orders', (req, res) => {
  const query = `
    SELECT 
      no.NotificationNo, no.Date, no.ProductCode, pr.Name, no.Quantity, no.OrderStatus,
      s.FirstName, s.LastName, s.Mobile, s.Email
    FROM NotificationOrder no
    JOIN Purchase p ON no.ProductCode = p.ProductCode
    JOIN Supplier s ON p.Username = s.Username
    JOIN Product pr ON no.ProductCode = pr.ProductCode
    WHERE no.OrderStatus = 'Ordered'
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
    res.json({ success: true, data: results });
  });
});

// Verify order
router.put('/order/verify/:notificationNo', (req, res) => {
  const { notificationNo } = req.params;
  const query = `
    UPDATE NotificationOrder
    SET OrderStatus = 'Verified', VerifiedDate = Now()
    WHERE NotificationNo = ?
  `;
  db.query(query, [notificationNo], (err, results) => {
    if (err) {
      console.error('Error updating order:', err);
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
    res.json({ success: true, message: 'Order verified successfully.' });
  });
});

// Cancel order
router.put('/order/cancel/:notificationNo', (req, res) => {
  const { notificationNo } = req.params;
  const query = `
    UPDATE NotificationOrder
    SET OrderStatus = 'Cancelled'
    WHERE NotificationNo = ?
  `;
  db.query(query, [notificationNo], (err, results) => {
    if (err) {
      console.error('Error updating order:', err);
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
    res.json({ success: true, message: 'Order cancelled successfully.' });
  });
});

// Fetch verified orders
router.get('/orders/verified', (req, res) => {
  const query = `
    SELECT 
      no.NotificationNo, no.ProductCode, no.Quantity, no.VerifiedDate, p.Name
    FROM NotificationOrder no
    JOIN Product p ON no.ProductCode = p.ProductCode
    WHERE no.OrderStatus = 'Verified'
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
    res.json({ success: true, data: results });
  });
});

// Complete order
router.put('/order/complete/:notificationNo', (req, res) => {
  const { notificationNo } = req.params;
  const query = `
    UPDATE NotificationOrder
    SET OrderStatus = 'Completed'
    WHERE NotificationNo = ?
  `;
  db.query(query, [notificationNo], (err, results) => {
    if (err) {
      console.error('Error updating order:', err);
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
    res.json({ success: true, message: 'Order completed successfully.' });
  });
});


//products-----------------------------------------------------------------------------------------------------

// Fetch products
router.get('/products', (req, res) => {
    const { search } = req.query;
    let sql = 'SELECT * FROM Product';
    if (search) {
      sql += ` WHERE ProductCode LIKE '%${search}%' OR Name LIKE '%${search}%'`;
    }
    db.query(sql, (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });
  
  // Add a new product
  router.post('/products', (req, res) => {
    const { ProductCode, Name, Description, Quantity, MinQuantity } = req.body;
  
    if (!PurchasePrice) {
      return res.status(400).json({ message: 'PurchasePrice is required' });
    }
  
    const checkSql = 'SELECT * FROM Product WHERE Name = ?';
    db.query(checkSql, [Name], (err, results) => {
      if (err) throw err;
      if (results.length > 0) {
        return res.status(400).json({ message: 'Product already exists' });
      }
  
      const sql = 'INSERT INTO Product (ProductCode, Name, Description, Quantity, MinQuantity) VALUES (?, ?, ?, ?, ?)';
      db.query(sql, [ProductCode, Name, Description, Quantity, MinQuantity], (err) => {
        if (err) throw err;
            res.json({ message: 'Product added successfully' });
          });
        });
      });
  
  // Update an existing product
  router.put('/products/:ProductCode', (req, res) => {
    const { ProductCode } = req.params;
    const { Name, Description, Quantity } = req.body;
  
    const sql = 'UPDATE Product SET Name = ?, Description = ?, Quantity = ? WHERE ProductCode = ?';
    db.query(sql, [Name, Description, Quantity, ProductCode], (err) => {
      if (err) throw err;
          res.json({ message: 'Product updated successfully' });
        });
      });
  // Delete a product
  router.delete('/products/:ProductCode', (req, res) => {
    const { ProductCode } = req.params;
  
    const sql = 'UPDATE Product SET MinQuantity = 0 WHERE ProductCode = ?';
    db.query(sql, [ProductCode], (err) => {
      if (err) throw err;
      res.json({ message: 'Product deleted successfully' });
    });
  });

export { router as StoreKeeperRouter};
