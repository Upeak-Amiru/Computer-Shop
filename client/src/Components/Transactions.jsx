import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Card, Table, Container, Row, Col, Modal } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead'; // For product name autocomplete

const Transactions = () => {
    const [customer, setCustomer] = useState({ name: '', phone: '' });
    const [products, setProducts] = useState([]);
    const [product, setProduct] = useState({ code: '', name: '', price: 0, discount: '', quantity: 1, warranty: '' });
    const [addedProducts, setAddedProducts] = useState([]);
    const [payment, setPayment] = useState({ cash: 0, card: 0 });
    const [bill, setBill] = useState({ date: '', billNo: '', totalDiscount: 0, totalPrice: 0 });
    const [showBill, setShowBill] = useState(false);

    useEffect(() => {
        // Fetch current date, time, and bill number when component mounts
        axios.get('http://localhost:3000/cashier/getCurrentBillInfo').then(response => {
            setBill({ ...bill, date: response.data.date, billNo: response.data.billNo });
        });
    }, []);

    const handleCustomerChange = (e) => {
        setCustomer({ ...customer, [e.target.name]: e.target.value });
    };

    const handleSaveCustomer = () => {
        // Save customer details
        axios.post('http://localhost:3000/cashier/saveCustomer', { customer }).then(response => {
            if (response.data.success) {
                alert('Customer saved successfully!');
            } else {
                alert('Error saving customer.');
            }
        });
    };

    const handleProductChange = (e) => {
        setProduct({ ...product, [e.target.name]: e.target.value });
    };

    const handleProductNameChange = (selected) => {
        if (selected.length > 0) {
            const selectedProduct = selected[0];
            setProduct({
                code: selectedProduct.ProductCode,
                name: selectedProduct.Name,
                price: selectedProduct.SellingPrice,
                discount: '',
                quantity: 1,
                warranty: selectedProduct.WarrantyDetail
            });
        } else {
            setProduct({ code: '', name: '', price: 0, discount: '', quantity: 1, warranty: '' });
        }
    };

    const handleProductSearch = (query) => {
        if (query.length > 2) {
            axios.get(`http://localhost:3000/cashier/searchProducts?query=${query}`).then(response => {
                setProducts(response.data);
            });
        }
    };

    const handleAddProduct = () => {
        // Validate product details and add to addedProducts list
        if (!product.discount) product.discount = '0'; // Default discount to 0
        axios.post('http://localhost:3000/cashier/validateProduct', { product }).then(response => {
            if (response.data.valid) {
                setAddedProducts([...addedProducts, { ...product, amount: calculateAmount(product) }]);
                setProduct({ code: '', name: '', price: 0, discount: '', quantity: 1, warranty: '' });
            } else {
                alert(response.data.message);
            }
        });
    };

    const calculateAmount = (product) => {
        let discount = 0;
        if (product.discount && product.discount !== '') {
            discount = product.discount.includes('%') ?
                (parseFloat(product.discount) / 100) * product.price :
                parseFloat(product.discount);
        }
        return (product.price - discount) * product.quantity;
    };

    // Inside handleCompleteTransaction function
    const handleCompleteTransaction = () => {
      // Submit the final transaction data
      const transactionData = {
          customer,
          products: addedProducts,
          payment,
          bill
      };
      axios.post('http://localhost:3000/cashier/completeTransaction', transactionData)
          .then(response => {
              if (response.data.success) {
                  setBill(response.data.bill);
                  setShowBill(true);
                  alert('Transaction completed successfully!');
              } else {
                  alert('Error completing transaction.');
              }
          })
          .catch(error => {
              alert('Error completing transaction.');
              console.error('Error:', error);
          });
  };


    const handlePaymentChange = (e) => {
        setPayment({ ...payment, [e.target.name]: e.target.value });
    };

    const calculateTotals = () => {
        let totalDiscount = 0;
        let totalPrice = 0;
        addedProducts.forEach(prod => {
            const discount = prod.discount.includes('%') ?
                (parseFloat(prod.discount) / 100) * prod.price :
                parseFloat(prod.discount);
            totalDiscount += discount * prod.quantity;
            totalPrice += (prod.price - discount) * prod.quantity;
        });

        return { totalDiscount, totalPrice };
    };

    useEffect(() => {
        const { totalDiscount, totalPrice } = calculateTotals();
        setBill({ ...bill, totalDiscount, totalPrice });
    }, [addedProducts]);

    return (
        <Container>
            <Card className="my-3 p-3">
                <Card.Body>
                    <Form>
                        <Form.Group controlId="customerName">
                            <Form.Label>Customer Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter customer name"
                                name="name"
                                value={customer.name}
                                onChange={handleCustomerChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="customerPhone">
                            <Form.Label>Customer Phone</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter customer phone"
                                name="phone"
                                value={customer.phone}
                                onChange={handleCustomerChange}
                            />
                        </Form.Group>
                        <Button variant="primary" onClick={handleSaveCustomer}>
                            Save Customer
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
            <Card className="my-3 p-3">
                <Card.Body>
                    <Form>
                        <Row>
                            <Form.Group as={Col} controlId="productCode">
                                <Form.Label>Product Code</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter product code"
                                    name="code"
                                    value={product.code}
                                    onChange={handleProductChange}
                                    readOnly
                                />
                            </Form.Group>
                            <Form.Group as={Col} controlId="productName">
                                <Form.Label>Product Name</Form.Label>
                                <Typeahead
                                    id="productName"
                                    placeholder="Enter product name"
                                    onInputChange={handleProductSearch}
                                    onChange={handleProductNameChange}
                                    options={products}
                                    labelKey="Name"
                                    selected={products.filter(p => p.Name === product.name)}
                                />
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} controlId="productPrice">
                                <Form.Label>Selling Price</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="Enter selling price"
                                    name="price"
                                    value={product.price}
                                    onChange={handleProductChange}
                                    readOnly
                                />
                            </Form.Group>
                            <Form.Group as={Col} controlId="productDiscount">
                                <Form.Label>Discount</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter discount"
                                    name="discount"
                                    value={product.discount}
                                    onChange={handleProductChange}
                                />
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} controlId="productQuantity">
                                <Form.Label>Quantity</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="Enter quantity"
                                    name="quantity"
                                    value={product.quantity}
                                    onChange={handleProductChange}
                                />
                            </Form.Group>
                            <Form.Group as={Col} controlId="productWarranty">
                                <Form.Label>Warranty</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter warranty details"
                                    name="warranty"
                                    value={product.warranty}
                                    onChange={handleProductChange}
                                    readOnly
                                />
                            </Form.Group>
                        </Row>
                        <Button variant="primary" onClick={handleAddProduct}>
                            Add Product
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
            <Card className="my-3 p-3">
                <Card.Body>
                    <h4>Selected Products</h4>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Product Code</th>
                                <th>Product Name</th>
                                <th>Price</th>
                                <th>Discount</th>
                                <th>Quantity</th>
                                <th>Total</th>
                                <th>Warranty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {addedProducts.map((prod, index) => (
                                <tr key={index}>
                                    <td>{prod.code}</td>
                                    <td>{prod.name}</td>
                                    <td>{prod.price}</td>
                                    <td>{prod.discount}</td>
                                    <td>{prod.quantity}</td>
                                    <td>{prod.amount}</td>
                                    <td>{prod.warranty}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <h5>Net Total Discount: {bill.totalDiscount && bill.totalDiscount}</h5>
                    <h5>Net Total Price: {bill.totalPrice}</h5>
                </Card.Body>
            </Card>
            <Card className="my-3 p-3">
                <Card.Body>
                    <h4>Select Payment Method</h4>
                    <Form>
                        <Form.Group controlId="paymentCash">
                            <Form.Label>Cash Payment</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Enter cash payment"
                                name="cash"
                                value={payment.cash}
                                onChange={handlePaymentChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="paymentCard">
                            <Form.Label>Card Payment</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Enter card payment"
                                name="card"
                                value={payment.card}
                                onChange={handlePaymentChange}
                            />
                        </Form.Group>
                    </Form>
                    <Button variant="success" onClick={handleCompleteTransaction}>
                        Complete Transaction
                    </Button>
                </Card.Body>
            </Card>
            <Modal show={showBill} onHide={() => setShowBill(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Bill Summary</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h5>Date: {bill.date}</h5>
                    <h5>Bill No: {bill.billNo}</h5>
                    <h5>Customer Name: {customer.name}</h5>
                    <h5>Customer Phone: {customer.phone}</h5>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>Price</th>
                                <th>Discount</th>
                                <th>Quantity</th>
                                <th>Total</th>
                                <th>Warranty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {addedProducts.map((prod, index) => (
                                <tr key={index}>
                                    <td>{prod.name}</td>
                                    <td>{prod.price}</td>
                                    <td>{prod.discount}</td>
                                    <td>{prod.quantity}</td>
                                    <td>{prod.amount}</td>
                                    <td>{prod.warranty}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <h5>Net Total Discount: {bill.totalDiscount}</h5>
                    <h5>Net Total Price: {bill.totalPrice}</h5>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Transactions;
