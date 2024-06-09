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

// Complete order and update product quantity
router.put('/order/complete/:notificationNo', (req, res) => {
  const { notificationNo } = req.params;

  const getOrderQuery = `
    SELECT ProductCode, Quantity 
    FROM NotificationOrder 
    WHERE NotificationNo = ?
  `;

  const updateOrderStatusQuery = `
    UPDATE NotificationOrder
    SET OrderStatus = 'Complete'
    WHERE NotificationNo = ?
  `;

  const updateProductQuantityQuery = `
    UPDATE Product
    SET Quantity = Quantity + ?
    WHERE ProductCode = ?
  `;

  db.query(getOrderQuery, [notificationNo], (err, results) => {
    if (err) {
      console.error('Error fetching order details:', err);
      return res.status(500).json({ success: false, message: 'Server error.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const { ProductCode, Quantity } = results[0];

    db.beginTransaction((err) => {
      if (err) {
        console.error('Error starting transaction:', err);
        return res.status(500).json({ success: false, message: 'Server error.' });
      }

      db.query(updateOrderStatusQuery, [notificationNo], (err, results) => {
        if (err) {
          return db.rollback(() => {
            console.error('Error updating order status:', err);
            res.status(500).json({ success: false, message: 'Server error.' });
          });
        }

        db.query(updateProductQuantityQuery, [Quantity, ProductCode], (err, results) => {
          if (err) {
            return db.rollback(() => {
              console.error('Error updating product quantity:', err);
              res.status(500).json({ success: false, message: 'Server error.' });
            });
          }

          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                console.error('Error committing transaction:', err);
                res.status(500).json({ success: false, message: 'Server error.' });
              });
            }
            res.json({ success: true, message: 'Order completed and product quantity updated.' });
          });
        });
      });
    });
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

  const checkSql = 'SELECT * FROM Product WHERE Name = ?';
  db.query(checkSql, [Name], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      return res.status(400).json({ message: 'Product already exists' });
    }

    const sql = 'INSERT INTO Product (ProductCode, Name, Description, Quantity, MinQuantity) VALUES (?, ?, ?, 0, 10)';
    db.query(sql, [ProductCode, Name, Description, Quantity, MinQuantity], (err) => {
      if (err) throw err;
          res.json({ message: 'Product added successfully' });
        });
      });
    });

// Update an existing product
router.put('/products/:ProductCode', (req, res) => {
  const { ProductCode } = req.params;
  const { Name, Description } = req.body;

  const sql = 'UPDATE Product SET Name = ?, Description = ? WHERE ProductCode = ?';
  db.query(sql, [Name, Description, ProductCode], (err) => {
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


//suppliers-----------------------------------------------------------------------------------------------------




// Get all suppliers with Sdelete set to 0
router.get('/suppliers', (req, res) => {
  const query = 'SELECT * FROM Supplier WHERE Sdelete = 0';
  db.query(query, (error, results) => {
      if (error) return res.status(500).json({ error: error.message });
      res.json(results);
  });
});

// Route to fetch products data for a specific supplier
router.get('/suppliers/:username/products', (req, res) => {
  const username = req.params.username;
  db.query('SELECT p.*, pu.PurchasePrice FROM Product p JOIN Purchase pu ON p.ProductCode = pu.ProductCode WHERE pu.Username = ?', [username], (error, results) => {
      if (error) {
          console.error('Error fetching products:', error);
          res.status(500).send('Internal Server Error');
          return;
      }
      res.json(results);
  });
});

// Route to add a new supplier
router.post('/suppliers', (req, res) => {
  const { FirstName, LastName, Mobile, Email, NIC, Products } = req.body;

  db.query('SELECT COUNT(*) AS count FROM Supplier', (error, results) => {
      if (error) {
          console.error('Error counting suppliers:', error);
          res.status(500).send('Internal Server Error');
          return;
      }

      const count = results[0].count;
      const username = `S${String(count + 1).padStart(3, '0')}`;

      db.query('INSERT INTO Supplier (Username, FirstName, LastName, Mobile, Email, NIC, Sdelete) VALUES (?, ?, ?, ?, ?, ?, 0)', [username, FirstName, LastName, Mobile, Email, NIC], (error, results) => {
          if (error) {
              console.error('Error inserting supplier:', error);
              res.status(500).send('Internal Server Error');
              return;
          }

          const purchaseQueries = Products.map(product => {
              return new Promise((resolve, reject) => {
                  db.query('INSERT INTO Purchase (Username, ProductCode, PurchasePrice) VALUES (?, ?, ?)', [username, product.ProductCode, product.PurchasePrice], (error, results) => {
                      if (error) {
                          return reject(error);
                      }
                      resolve(results);
                  });
              });
          });

          Promise.all(purchaseQueries)
              .then(() => res.status(201).send('Supplier added successfully'))
              .catch(error => {
                  console.error('Error inserting purchases:', error);
                  res.status(500).send('Internal Server Error');
              });
      });
  });
});

// Route to fetch supplier details including their products
router.get('/suppliers/:username', (req, res) => {
  const username = req.params.username;

  db.query('SELECT * FROM Supplier WHERE Username = ?', [username], (error, supplierResults) => {
      if (error) {
          console.error('Error fetching supplier details:', error);
          res.status(500).send('Internal Server Error');
          return;
      }

      db.query('SELECT p.ProductCode, p.Name AS ProductName, pu.PurchasePrice FROM Product p JOIN Purchase pu ON p.ProductCode = pu.ProductCode WHERE pu.Username = ?', [username], (error, productResults) => {
          if (error) {
              console.error('Error fetching supplier products:', error);
              res.status(500).send('Internal Server Error');
              return;
          }

          const supplier = supplierResults[0];
          supplier.Products = productResults;
          res.json(supplier);
      });
  });
});

// Route to update supplier details
router.put('/suppliers/:username', (req, res) => {
  const username = req.params.username;
  const { FirstName, LastName, Mobile, Email, NIC, Products } = req.body;

  db.query('UPDATE Supplier SET FirstName = ?, LastName = ?, Mobile = ?, Email = ?, NIC = ? WHERE Username = ?', [FirstName, LastName, Mobile, Email, NIC, username], (error, results) => {
      if (error) {
          console.error('Error updating supplier:', error);
          res.status(500).send('Internal Server Error');
          return;
      }

      db.query('DELETE FROM Purchase WHERE Username = ?', [username], (error, results) => {
          if (error) {
              console.error('Error deleting old purchases:', error);
              res.status(500).send('Internal Server Error');
              return;
          }

          const purchaseQueries = Products.map(product => {
              return new Promise((resolve, reject) => {
                  db.query('INSERT INTO Purchase (Username, ProductCode, PurchasePrice) VALUES (?, ?, ?)', [username, product.ProductCode, product.PurchasePrice], (error, results) => {
                      if (error) {
                          return reject(error);
                      }
                      resolve(results);
                  });
              });
          });

          Promise.all(purchaseQueries)
              .then(() => res.status(200).send('Supplier updated successfully'))
              .catch(error => {
                  console.error('Error adding new purchases:', error);
                  res.status(500).send('Internal Server Error');
              });
      });
  });
});

// Route to fetch product details by code or name
router.get('/products/:field/:value', (req, res) => {
  const { field, value } = req.params;
  const queryField = field === 'ProductCode' ? 'ProductCode' : 'Name';
  db.query(`SELECT * FROM Product WHERE ${queryField} = ?`, [value], (error, results) => {
      if (error) {
          console.error('Error fetching product details:', error);
          res.status(500).send('Internal Server Error');
          return;
      }
      res.json(results[0]);
  });
});
// Check if supplier exists with the same NIC and is marked as deleted
router.post('/suppliers/check', (req, res) => {
  const { NIC } = req.body;
  const checkDeletedQuery = 'SELECT * FROM Supplier WHERE NIC = ? AND Sdelete = 1';
  const updateSdeleteQuery = 'UPDATE Supplier SET Sdelete = 0 WHERE NIC = ?';
  const checkExistingQuery = 'SELECT * FROM Supplier WHERE NIC = ? AND Sdelete = 0';

  db.query(checkDeletedQuery, [NIC], (error, results) => {
      if (error) return res.status(500).json({ error: error.message });

      if (results.length > 0) {
          db.query(updateSdeleteQuery, [NIC], (error) => {
              if (error) return res.status(500).json({ error: error.message });
              res.json({ reinstated: true });
          });
      } else {
          db.query(checkExistingQuery, [NIC], (error, results) => {
              if (error) return res.status(500).json({ error: error.message });
              res.json({ exists: results.length > 0 });
          });
      }
  });
});


// Mark supplier as deleted (Sdelete to 1)
router.put('/suppliers/:username/delete', (req, res) => {
  const { username } = req.params;
  const query = 'UPDATE Supplier SET Sdelete = 1 WHERE Username = ?';
  db.query(query, [username], (error) => {
      if (error) return res.status(500).json({ error: error.message });
      res.json({ message: 'Supplier deleted successfully' });
  });
});



export { router as StoreKeeperRouter};
