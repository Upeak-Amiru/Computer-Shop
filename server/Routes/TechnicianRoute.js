import express from 'express';
import db from '../config/db.js';
const router = express.Router();

// Fetch repairs for technician dashboard
router.get('/getRepairs', (req, res) => {
    const query = `
        SELECT 
            rb.RBillNo, 
            rb.Date, 
            rb.Time, 
            rb.Warranty, 
            rb.Advance, 
            rb.Finish, 
            c.Name AS CustomerName, 
            c.Mobile AS CustomerMobile, 
            p.Name AS ProductName,
            COALESCE(rj.Description, '') AS Description,
            COALESCE(rj.TechnicianCost, '') AS TechnicianCost,
            COALESCE(rj.RepairStatus, 'Waiting') AS RepairStatus
        FROM RepairBill rb
        JOIN Bill b ON rb.BillNo = b.BillNo
        JOIN Customer c ON b.CustomerCode = c.CustomerCode
        JOIN Product p ON rb.ProductCode = p.ProductCode
        LEFT JOIN RepairJob rj ON rb.RBillNo = rj.RBillNo
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.json(results);
    });
});

// Fetch repair job details
router.get('/getRepairJob/:rBillNo', (req, res) => {
    const { rBillNo } = req.params;
    db.query('SELECT * FROM RepairJob WHERE RBillNo = ?', [rBillNo], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.json({});
        }
    });
});

// Update repair job details
router.post('/updateRepairJob', (req, res) => {
    const { rBillNo, description, technicianCost, repairStatus } = req.body;

    const repairJobData = {
        Description: description,
        TechnicianCost: technicianCost,
        RepairStatus: repairStatus
    };

    // Check if the repair job exists
    db.query('SELECT * FROM RepairJob WHERE RBillNo = ?', [rBillNo], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (results.length > 0) {
            // Update the existing repair job
            db.query('UPDATE RepairJob SET ? WHERE RBillNo = ?', [repairJobData, rBillNo], (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }
                res.json({ message: 'Repair job updated successfully' });
            });
        } else {
            // Insert new repair job
            repairJobData.RBillNo = rBillNo;
            db.query('INSERT INTO RepairJob SET ?', repairJobData, (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }
                res.json({ message: 'Repair job created successfully' });
            });
        }
    });
});




//RepairBill-----------------------------------------------------------------------------------------------------

// Fetch repairs with RepairStatus "Processing"
router.get('/getProcessingRepairs', (req, res) => {
    const query = `
        SELECT 
            rb.RBillNo, 
            rb.Date, 
            rb.Time, 
            rb.Warranty, 
            rb.Advance, 
            rb.Finish, 
            c.Name AS CustomerName, 
            c.Mobile AS CustomerMobile, 
            p.Name AS ProductName,
            rj.Description,
            rj.TechnicianCost,
            rj.RepairStatus
        FROM RepairBill rb
        JOIN Bill b ON rb.BillNo = b.BillNo
        JOIN Customer c ON b.CustomerCode = c.CustomerCode
        JOIN Product p ON rb.ProductCode = p.ProductCode
        JOIN RepairJob rj ON rb.RBillNo = rj.RBillNo
        WHERE rj.RepairStatus = 'Processing'
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.json(results);
    });
});

// Get product suggestions based on the name
router.get('/getProductSuggestions/:name', (req, res) => {
    const { name } = req.params;
    db.query('SELECT Name FROM Product WHERE Name LIKE ?', [`%${name}%`], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.json(results);
    });
});

// Add accessories to RepairBillProduct
router.post('/addRepairBillProducts', (req, res) => {
    const { rBillNo, products } = req.body;

    const productQueries = products.map(product => {
        return new Promise((resolve, reject) => {
            db.query('SELECT ProductCode FROM Product WHERE Name = ?', [product.productName], (err, results) => {
                if (err) {
                    return reject(err);
                }
                if (results.length > 0) {
                    const { ProductCode } = results[0];
                    db.query('INSERT INTO RepairBillProduct SET ?', {
                        RBillNo: rBillNo,
                        ProductCode,
                        Quantity: product.quantity,
                        Discount: product.discount
                    }, (err, result) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve();
                    });
                } else {
                    reject(new Error('Product not found'));
                }
            });
        });
    });

    Promise.all(productQueries)
        .then(() => res.json({ message: 'Products added successfully' }))
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error' });
        });
});

// Finish repair job
router.post('/finishRepair', (req, res) => {
    const { rBillNo } = req.body;

    db.query('UPDATE RepairJob SET RepairStatus = "Finished" WHERE RBillNo = ?', [rBillNo], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.json({ message: 'Repair status updated to Finished' });
    });
});

export { router as TechnicianRouter };
