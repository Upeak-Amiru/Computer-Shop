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




// Fetch current date, time, and next bill number
router.get('/getCurrentBillInfo', (req, res) => {
  const date = new Date();
  const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  
  db.query('SELECT MAX(BillNo) AS BillNo FROM Bill', (err, result) => {
      if (err) throw err;
      const nextBillNo = result[0].BillNo ? result[0].BillNo + 1 : 1;
      res.json({ date: `${formattedDate} ${time}`, billNo: nextBillNo });
  });
});

// Search products by name
router.get('/searchProducts', (req, res) => {
  const query = req.query.query;
  db.query(`SELECT ProductCode, Name, SellingPrice, WarrantyDetail FROM Product WHERE Name LIKE '%${query}%'`, (err, result) => {
      if (err) throw err;
      res.json(result);
  });
});

// Save customer details
router.post('/saveCustomer', (req, res) => {
  const { name, phone } = req.body.customer;
  db.query('SELECT * FROM Customer WHERE Mobile = ?', [phone], (err, result) => {
      if (err) throw err;
      if (result.length === 0) {
          const newCustomer = { Mobile: phone, Name: name };
          db.query('INSERT INTO Customer SET ?', newCustomer, (err, result) => {
              if (err) throw err;
              res.json({ success: true, customerCode: result.insertId });
          });
      } else {
          res.json({ success: true, customerCode: result[0].CustomerCode });
      }
  });
});

// Validate product details
router.post('/validateProduct', (req, res) => {
  const { code, name } = req.body.product;
  let query = `SELECT * FROM Product WHERE `;
  if (code) query += `ProductCode = '${code}'`;
  else query += `Name LIKE '%${name}%'`;

  db.query(query, (err, result) => {
      if (err) throw err;
      if (result.length === 0) {
          res.json({ valid: false, message: 'Invalid product' });
      } else {
          const product = result[0];
          if (product.Quantity === 0) {
              res.json({ valid: false, message: 'Out of stock' });
          } else {
              res.json({ valid: true, product });
          }
      }
  });
});

// Complete transaction
router.post('/completeTransaction', (req, res) => {
  const { customer, products, payment, bill } = req.body;

  db.query('SELECT * FROM Customer WHERE Mobile = ?', [customer.phone], (err, result) => {
      if (err) throw err;

      let customerCode;
      if (result.length === 0) {
          const newCustomer = {
              Mobile: customer.phone,
              Name: customer.name
          };
          db.query('INSERT INTO Customer SET ?', newCustomer, (err, result) => {
              if (err) throw err;
              customerCode = result.insertId;
              completeBillTransaction(customerCode);
          });
      } else {
          customerCode = result[0].CustomerCode;
          completeBillTransaction(customerCode);
      }
  });

  const completeBillTransaction = (customerCode) => {
    const newBill = {
        BillNo: bill.billNo,
        Date: new Date(),
        CustomerCode: customerCode
    };
    db.query('INSERT INTO Bill SET ?', newBill, (err, result) => {
        if (err) {
            console.error('Error inserting into Bill table:', err);
            return res.json({ success: false, message: 'Error completing transaction.' });
        }
    });

    products.forEach(product => {
        const productCode = product.code;
        const quantityNeeded = product.quantity;

        // Retrieve BatchNo from Batch table where RemainingQuantity > 0 and find the least PurchasePrice
        const batchQuery = `
            SELECT BatchNo, RemainingQuantity
            FROM Batch
            WHERE ProductCode = ? AND RemainingQuantity > 0
            ORDER BY PurchasePrice ASC`;

        db.query(batchQuery, [productCode], (err, result) => {
            if (err) {
                console.error('Error retrieving batch details:', err);
                return res.json({ success: false, message: 'Error completing transaction.' });
            }
            let remainingQuantity = quantityNeeded;
            for (let i = 0; i < result.length; i++) {
                const batchNo = result[i].BatchNo;
                const remaining = result[i].RemainingQuantity;
                const quantityToUse = Math.min(remaining, remainingQuantity);

                if (quantityToUse > 0) {
                    const billItem = {
                        BillNo: bill.billNo,
                        BatchNo: batchNo,
                        DiscountPerOne: product.discount,
                        Quantity: quantityToUse
                    };
                    db.query('INSERT INTO BillItem SET ?', billItem, (err, result) => {
                        if (err) {
                            console.error('Error inserting into BillItem table:', err);
                            return res.json({ success: false, message: 'Error completing transaction.' });
                        }
                    });

                    // Update RemainingQuantity in Batch table
                    db.query('UPDATE Batch SET RemainingQuantity = RemainingQuantity - ? WHERE BatchNo = ?', [quantityToUse, batchNo], (err, result) => {
                        if (err) {
                            console.error('Error updating RemainingQuantity in Batch table:', err);
                            return res.json({ success: false, message: 'Error completing transaction.' });
                        }
                    });

                    remainingQuantity -= quantityToUse;
                }

                if (remainingQuantity === 0) break;
            }

            if (remainingQuantity > 0) {
                // If ordered quantity exceeds total remaining quantity for a product
                return res.json({ success: false, message: `Insufficient stock for product code: ${productCode}` });
            }
        });
    });

    // Reduce the ordered quantity from the Product table Quantity
    products.forEach(product => {
        const productCode = product.code;
        const quantityNeeded = product.quantity;

        db.query('UPDATE Product SET Quantity = Quantity - ? WHERE ProductCode = ?', [quantityNeeded, productCode], (err, result) => {
            if (err) {
                console.error('Error updating product quantity:', err);
                return res.json({ success: false, message: 'Error completing transaction.' });
            }
        });
    });

    const newPayment = {
        BillNo: bill.billNo,
        Cash: payment.cash,
        Card: payment.card,
        Date: new Date()
    };
    db.query('INSERT INTO Payment SET ?', newPayment, (err, result) => {
        if (err) {
            console.error('Error inserting into Payment table:', err);
            return res.json({ success: false, message: 'Error completing transaction.' });
        }
        res.json({ success: true, bill });
    });
  }
}
);


//Repairs-------------------------------------------------------------------------------------------------------------------
// Fetch products for suggestions
router.get('/getProducts', (req, res) => {
  db.query('SELECT ProductCode, Name FROM Product', (err, results) => {
      if (err) throw err;
      res.json(results);
  });
});

// Save customer
router.post('/saveCustomerRepair', (req, res) => {
  const { name, phone } = req.body;

  db.query('SELECT * FROM Customer WHERE Mobile = ?', [phone], (err, result) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Internal Server Error' });
      }

      const insertBill = (customerCode) => {
          const date = new Date();
          const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
          const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
          const billData = {
              Date: formattedDate,
              Time: time,
              CustomerCode: customerCode
          };

          db.query('INSERT INTO Bill SET ?', billData, (err, result) => {
              if (err) {
                  console.error(err);
                  return res.status(500).json({ message: 'Internal Server Error' });
              }
              res.json({ success: true, billNo: result.insertId, customerCode });
          });
      };

      if (result.length === 0) {
          const newCustomer = { Mobile: phone, Name: name };
          db.query('INSERT INTO Customer SET ?', newCustomer, (err, result) => {
              if (err) {
                  console.error(err);
                  return res.status(500).json({ message: 'Internal Server Error' });
              }
              insertBill(result.insertId);
          });
      } else {
          insertBill(result[0].CustomerCode);
      }
  });
});

// Issue repair bill
router.post('/issueRepairBill', (req, res) => {
  console.log('Request Body:', req.body); // Debugging line

  const { billNo, productCode, warranty, advance } = req.body;
  
  const date = new Date();
  const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

  const repairBillData = {
      BillNo: billNo,
      Date: formattedDate,
      Time: time,
      Warranty: warranty,
      ProductCode: productCode,
      Advance: advance || 0,
      Finish: 0
  };

  db.query('INSERT INTO RepairBill SET ?', repairBillData, (err, result) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Internal Server Error' });
      }
      res.json({ message: 'Repair bill issued' });
  });
});

// Get repairs
router.get('/getRepairs', (req, res) => {
  const query = `
      SELECT 
          c.Name as customerName, 
          c.Mobile as customerMobile, 
          rb.Date, 
          p.Name as productName, 
          rb.Advance, 
          rb.Finish as status 
      FROM RepairBill rb
      JOIN Bill b ON rb.BillNo = b.BillNo
      JOIN Customer c ON b.CustomerCode = c.CustomerCode
      JOIN Product p ON rb.ProductCode = p.ProductCode
  `;
  db.query(query, (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Internal Server Error' });
      }
      res.json(results);
  });
});



export { router as CashierRouter };
