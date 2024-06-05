import express from 'express';
import db from '../config/db.js';
const router = express.Router();

router.get('/transactions', (req, res) => {
  db.query('SELECT * FROM Transactions', (err, results) => {
    if (err) {
      console.error('Error fetching transactions:', err);
      res.status(500).json({ success: false, message: 'Server error.' });
    } else {
      res.json(results);
    }
  });
});

router.get('/repairs', (req, res) => {
  db.query('SELECT * FROM Repairs', (err, results) => {
    if (err) {
      console.error('Error fetching repairs:', err);
      res.status(500).json({ success: false, message: 'Server error.' });
    } else {
      res.json(results);
    }
  });
});

router.get('/dayend', (req, res) => {
  db.query('SELECT * FROM DayEnd', (err, results) => {
    if (err) {
      console.error('Error fetching day end data:', err);
      res.status(500).json({ success: false, message: 'Server error.' });
    } else {
      res.json(results);
    }
  });
});

//transactions-------------------------------------------------------------------------------------------------------------------



// Helper function to generate new bill number and current date/time
const generateBillNo = (callback) => {
  db.query('SELECT MAX(BillNo) AS maxBillNo FROM Bill', (err, result) => {
    if (err) return callback(err);

    const maxBillNo = result[0]?.maxBillNo || 0;
    const newBillNo = maxBillNo + 1;
    const currentDate = new Date();
    const date = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = currentDate.toTimeString().split(' ')[0]; // HH:MM:SS
    callback(null, { billNo: newBillNo, date, time });
  });
};

// Get new bill number, date, and time
router.get('/new-bill', (req, res) => {
  generateBillNo((err, { billNo, date, time }) => {
    if (err) {
      console.error('Error generating new bill:', err);
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
    res.json({ billNo, date, time });
  });
});

// Get product suggestions
router.get('/products', (req, res) => {
  const query = req.query.query;
  db.query('SELECT Name FROM Product WHERE Name LIKE ? OR ProductCode LIKE ?', [`%${query}%`, `%${query}%`], (err, results) => {
    if (err) {
      console.error('Error fetching product suggestions:', err);
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
    res.json(results);
  });
});

// Get product details by code
router.get('/product/code/:code', (req, res) => {
  const code = decodeURIComponent(req.params.code);
  db.query('SELECT p.ProductCode AS code, p.Name AS name, b.Price AS price, p.Quantity AS quantity, b.WarrantyDetail AS warranty FROM Product p JOIN Batch b ON p.ProductCode = b.ProductCode WHERE p.ProductCode = ?', [code], (err, result) => {
    if (err) {
      console.error('Error fetching product:', err);
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json(result[0]);
  });
});

// Get product details by name
router.get('/product/name/:name', (req, res) => {
  const name = decodeURIComponent(req.params.name);
  db.query('SELECT p.ProductCode AS code, p.Name AS name, b.Price AS price, p.Quantity AS quantity, b.WarrantyDetail AS warranty FROM Product p JOIN Batch b ON p.ProductCode = b.ProductCode WHERE p.Name = ?', [name], (err, result) => {
    if (err) {
      console.error('Error fetching product:', err);
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json(result[0]);
  });
});

// Save bill
router.post('/save-bill', (req, res) => {
  const { customer, billNo, date, products, totalDiscount, totalPrice } = req.body;

  // Save customer
  db.query('SELECT CustomerCode FROM Customer WHERE Mobile = ? AND Name = ?', [customer.mobile, customer.name], (err, customerResult) => {
    if (err) {
      console.error('Error fetching customer:', err);
      return res.status(500).json({ success: false, message: 'Server error.' });
    }

    let customerCode;
    const saveCustomer = (callback) => {
      if (customerResult.length === 0) {
        db.query('INSERT INTO Customer (Mobile, Name) VALUES (?, ?)', [customer.mobile, customer.name], (err, result) => {
          if (err) return callback(err);
          customerCode = result.insertId;
          callback(null);
        });
      } else {
        customerCode = customerResult[0].CustomerCode;
        callback(null);
      }
    };

    saveCustomer((err) => {
      if (err) {
        console.error('Error saving customer:', err);
        return res.status(500).json({ success: false, message: 'Server error.' });
      }

      // Save bill
      db.query('INSERT INTO Bill (BillNo, Date, Time) VALUES (?, ?, ?)', [billNo, date, new Date().toISOString().split('T')[1]], (err) => {
        if (err) {
          console.error('Error saving bill:', err);
          return res.status(500).json({ success: false, message: 'Server error.' });
        }

        // Save products and payments
        const saveProducts = (index) => {
          if (index >= products.length) {
            return res.json({ success: true, message: 'Bill saved successfully.' });
          }

          const product = products[index];
          const discount = product.discountType === 'percentage'
            ? (product.discount / 100) * product.price
            : product.discount;

          const amount = (product.price - discount) * product.quantity;

          db.query('INSERT INTO Payment (BillNo, Discount, Amount, Quantity, Date) VALUES (?, ?, ?, ?, ?)', [billNo, discount, amount, product.quantity, date], (err) => {
            if (err) {
              console.error('Error saving payment:', err);
              return res.status(500).json({ success: false, message: 'Server error.' });
            }

            // Reduce quantity from Product table
            db.query('UPDATE Product SET Quantity = Quantity - ? WHERE ProductCode = ?', [product.quantity, product.code], (err) => {
              if (err) {
                console.error('Error updating product quantity:', err);
                return res.status(500).json({ success: false, message: 'Server error.' });
              }

              saveProducts(index + 1);
            });
          });
        };

        saveProducts(0);
      });
    });
  });
});

export { router as CashierRouter };
