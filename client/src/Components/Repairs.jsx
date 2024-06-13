import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Card, Container } from 'react-bootstrap';

const Repairs = () => {
    const [customer, setCustomer] = useState({ name: '', phone: '' });
    const [product, setProduct] = useState({ name: '', advance: 0 });
    const [warranty, setWarranty] = useState(null);
    const [products, setProducts] = useState([]);
    const [productSuggestions, setProductSuggestions] = useState([]);
    const [billNo, setBillNo] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:3000/cashier/getProducts')
            .then(response => setProducts(response.data))
            .catch(error => console.error(error));
    }, []);

    const handleProductChange = (e) => {
        setProduct({ ...product, name: e.target.value });
        const query = e.target.value.toLowerCase();
        const suggestions = products.filter(p => p.Name.toLowerCase().includes(query));
        setProductSuggestions(suggestions);
    };

    const handleWarrantyChange = (value) => {
        setWarranty(value);
        setProduct({ ...product, advance: 0 }); // Reset advance if warranty changes
    };

    const handleCustomerChange = (e) => {
        setCustomer({ ...customer, [e.target.name]: e.target.value });
    };

    const handleSaveCustomer = () => {
        axios.post('http://localhost:3000/cashier/saveCustomerRepair', customer).then(response => {
            if (response.data.success) {
                alert('Customer saved successfully!');
                setBillNo(response.data.billNo);
            } else {
                alert('Error saving customer.');
            }
        });
    };

    const handleEnter = () => {
        const selectedProduct = products.find(p => p.Name === product.name);
        const repairData = {
            billNo,
            productCode: selectedProduct ? selectedProduct.ProductCode : null,
            warranty,
            advance: product.advance
        };
        axios.post('http://localhost:3000/cashier/issueRepairBill', repairData)
            .then(response => alert(response.data.message))
            .catch(error => console.error(error));
    };

    return (
        <Container>
            <Button variant="primary" className="my-3" onClick={() => window.location.href='/CashierDashboard/repairs/cashiershowrepairs'}>
                Show Repairs
            </Button>
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
                        <Button variant="success" onClick={handleSaveCustomer}>
                            Save
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
            <Card className="my-3 p-3">
                <Card.Body>
                    <Form>
                        <Form.Check
                            type="radio"
                            label="Non-Warranty"
                            name="warrantyType"
                            onChange={() => handleWarrantyChange(0)}
                            checked={warranty === 0}
                        />
                        <Form.Check
                            type="radio"
                            label="Warranty"
                            name="warrantyType"
                            onChange={() => handleWarrantyChange(1)}
                            checked={warranty === 1}
                        />
                        <div style={{ backgroundColor: warranty === 0 ? 'lightblue' : 'lightgreen', padding: '1rem', marginTop: '1rem' }}>
                            <Form.Group controlId="productName">
                                <Form.Label>Product Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter product name"
                                    name="name"
                                    value={product.name}
                                    onChange={handleProductChange}
                                    list="productSuggestions"
                                />
                                <datalist id="productSuggestions">
                                    {productSuggestions.map((p, index) => (
                                        <option key={index} value={p.Name} />
                                    ))}
                                </datalist>
                            </Form.Group>
                            {warranty === 0 && (
                                <Form.Group controlId="advance">
                                    <Form.Label>Advance</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter advance amount"
                                        name="advance"
                                        value={product.advance}
                                        onChange={e => setProduct({ ...product, advance: e.target.value })}
                                    />
                                </Form.Group>
                            )}
                        </div>
                        <Button variant="primary" className="mt-3" onClick={handleEnter}>
                            Enter
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Repairs;
