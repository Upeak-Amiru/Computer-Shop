// routes/ManagerRoute.js
import express from 'express';
import db from '../config/db.js';

const router = express.Router();
//Inventory.jsx-----------------------------------------------------------------------------------------------------

router.get('/inventory', (req, res) => {
  const query = `
    SELECT p.ProductCode, p.Name, p.Description, p.Quantity, p.WarrantyDetail, p.SellingPrice
    FROM Product p
    WHERE p.MinQuantity > 0  -- Exclude products with Minquantity 0
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
    res.json({ success: true, data: results });
  });
});

//Order.jsx-----------------------------------------------------------------------------------------------------

// Fetch products where Quantity is less than MinQuantity and exclude products from deleted suppliers
router.get('/orders', (req, res) => {
  const query = `
    SELECT p.ProductCode, p.Name, p.Description, p.Quantity
    FROM Product p
    JOIN Purchase pu ON p.ProductCode = pu.ProductCode
    JOIN Supplier s ON pu.Username = s.Username
    WHERE p.Quantity < p.MinQuantity AND s.Sdelete = 0
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
    res.json({ success: true, data: results });
  });
});

// Fetch the order list
router.get('/orderlist', (req, res) => {
  const query = `
    SELECT n.NotificationNo, n.Date, n.ProductCode, p.Name, n.Quantity, n.OrderStatus
    FROM NotificationOrder n
    JOIN Product p ON p.ProductCode = n.ProductCode
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
    res.json({ success: true, data: results });
  });
});

// Add a new order
router.post('/order', (req, res) => {
  const { ProductCode, Quantity } = req.body;

  if (!Number.isInteger(Number(Quantity)) || Number(Quantity) <= 0) {
    return res.status(400).json({ success: false, message: 'Quantity must be a positive integer greater than 0.' });
  }

  const query = `
    INSERT INTO NotificationOrder (Date, ProductCode, Quantity, OrderStatus)
    VALUES (NOW(), ?, ?, 'Ordered')
  `;
  db.query(query, [ProductCode, Quantity], (err, results) => {
    if (err) {
      console.error('Error inserting into NotificationOrder:', err);
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
    res.json({ success: true, message: 'Order added successfully.' });
  });
});






// Fetch all products for properties view, excluding those with MinQuantity 0 and products from deleted suppliers
router.get('/products', (req, res) => {
  const query = `
    SELECT p.ProductCode, p.Name, p.MinQuantity
    FROM Product p
    JOIN Purchase pu ON p.ProductCode = pu.ProductCode
    JOIN Supplier s ON pu.Username = s.Username
    WHERE p.MinQuantity != 0 AND s.Sdelete = 0
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
    res.json({ success: true, data: results });
  });
});

// Update MinQuantity of a product
router.put('/product/:productCode', (req, res) => {
  const { productCode } = req.params;
  const { minQuantity } = req.body;

  const query = `
    UPDATE Product
    SET MinQuantity = ?
    WHERE ProductCode = ?
  `;
  db.query(query, [minQuantity, productCode], (err, results) => {
    if (err) {
      console.error('Error updating product:', err);
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
    res.json({ success: true, message: 'MinQuantity updated successfully.' });
  });
})
//ManageAccounts.jsx ---------------------------------------------------------------------------------------------------
// Get all users
router.get('/users', (req, res) => {
  db.query('SELECT * FROM Users', function (err, results) {
    if (err) {
      console.error('Error fetching users:', err);
      res.status(500).send(err.message);
    } else {
      res.json(results);
    }
  });
});
// Add a new user
router.post('/users', (req, res) => {
  const { username, password, firstName, lastName, mobile, email, nic, role } = req.body;
  bcrypt.hash(password, 10, function (err, hashedPassword) {
    if (err) {
      res.status(500).send(err.message);
    } else {
      db.query('INSERT INTO Users (username, password, FirstName, LastName, Mobile, Email, NIC, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [username, hashedPassword, firstName, lastName, mobile, email, nic, role], function (err) {
          if (err) {
            res.status(500).send(err.message);
          } else {
            res.send(`${role} added successfully!`);
          }
        });
    }
  });
});

// Update a user
router.put('/users', (req, res) => {
  const { username, password, firstName, lastName, mobile, email, nic, role } = req.body;
  bcrypt.hash(password, 10, function (err, hashedPassword) {
    if (err) {
      res.status(500).send(err.message);
    } else {
      db.query('UPDATE Users SET password=?, FirstName=?, LastName=?, Mobile=?, Email=?, NIC=? WHERE username=? AND role=?',
        [hashedPassword, firstName, lastName, mobile, email, nic, username, role], function (err) {
          if (err) {
            res.status(500).send(err.message);
          } else {
            res.send(`${role} updated successfully!`);
          }
        });
    }
  });
});

// Delete a user
router.delete('/users/:username', (req, res) => {
  const { username } = req.params;
  db.query('DELETE FROM Users WHERE username=?', [username], function (err, results) {
    if (err) {
      console.error('Error deleting user:', err);
      res.status(500).send(err.message);
    } else {
      res.send('User deleted successfully!');
    }
  });
});



// Get user details by username
router.get('/users/:username', (req, res) => {
  const { username } = req.params;
  db.query('SELECT * FROM Users WHERE username=?', [username], function (err, results) {
    if (err) {
      console.error('Error fetching user details:', err);
      res.status(500).send(err.message);
    } else {
      if (results.length > 0) {
        res.json(results[0]);
      } else {
        res.status(404).send('User not found');
      }
    }
  });
});

//otherRoles.jsx---------------------------------------------------------------------------------------------------
// Verify manager credentials with rollback functionality
router.post('/verifyManager', (req, res) => {
  const { username, password } = req.body;

  // Query for the manager user
  db.query('SELECT * FROM Users WHERE role = "Manager" AND username = ?', [username], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ success: false, message: 'Server error.' });
    }

    if (results.length === 0 || results[0].password !== password) {
      res.status(401).json({ success: false, message: 'Invalid credentials.' });
    } else {
      res.json({ success: true, message: 'Login successful.' });
    }
  });
});
export { router as ManagerRouter };
