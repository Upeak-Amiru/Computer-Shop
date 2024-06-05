import express from 'express';
import db from '../config/db.js';
const router = express.Router();





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
