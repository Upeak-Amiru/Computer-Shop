import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Button, Modal, Form } from 'react-bootstrap';

const TechnicianRepairBill = () => {
    const [repairs, setRepairs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentRBillNo, setCurrentRBillNo] = useState(null);
    const [products, setProducts] = useState([{ productName: '', quantity: 1, discount: 0 }]);
    const [productSuggestions, setProductSuggestions] = useState([]);

    useEffect(() => {
        fetchProcessingRepairs();
    }, []);

    const fetchProcessingRepairs = () => {
        axios.get('http://localhost:3000/technician/getProcessingRepairs')
            .then(response => setRepairs(response.data))
            .catch(error => console.error(error));
    };

    const handleAddAccessoriesClick = (rBillNo) => {
        setCurrentRBillNo(rBillNo);
        setShowModal(true);
    };

    const handleFinishRepair = (rBillNo) => {
        axios.post('http://localhost:3000/technician/finishRepair', { rBillNo })
            .then(response => {
                alert(response.data.message);
                setRepairs(repairs.filter(repair => repair.RBillNo !== rBillNo));
            })
            .catch(error => {
                console.error("Error finishing repair: ", error);
                alert('There was an error finishing the repair. Please try again.');
            });
    };

    const handleModalClose = () => {
        setShowModal(false);
        setCurrentRBillNo(null);
        setProducts([{ productName: '', quantity: 1, discount: 0 }]);
        setProductSuggestions([]);
    };

    const handleProductChange = (index, field, value) => {
        const newProducts = [...products];
        newProducts[index][field] = value;
        setProducts(newProducts);

        if (field === 'productName' && value) {
            axios.get(`http://localhost:3000/technician/getProductSuggestions/${value}`)
                .then(response => setProductSuggestions(response.data))
                .catch(error => console.error(error));
        } else {
            setProductSuggestions([]);
        }
    };

    const handleAddProduct = () => {
        setProducts([...products, { productName: '', quantity: 1, discount: 0 }]);
    };

    const handleSave = () => {
        axios.post('http://localhost:3000/technician/addRepairBillProducts', {
            rBillNo: currentRBillNo,
            products
        })
        .then(response => {
            alert(response.data.message);
            handleModalClose();
        })
        .catch(error => {
            console.error("Error saving products: ", error);
            alert('There was an error saving the products. Please try again.');
        });
    };

    return (
        <Container>
            {repairs.map((repair, index) => (
                <Card key={index} className="my-3 p-3">
                    <Card.Body>
                        <Card.Title>{repair.RBillNo}</Card.Title>
                        <Card.Text>
                            <strong>Customer Name:</strong> {repair.CustomerName}<br />
                            <strong>Customer Mobile:</strong> {repair.CustomerMobile}<br />
                            <strong>Product Name:</strong> {repair.ProductName}<br />
                            <strong>Description:</strong> {repair.Description}
                        </Card.Text>
                        <Button variant="primary" onClick={() => handleAddAccessoriesClick(repair.RBillNo)}>
                            Add Accessories
                        </Button>
                        <Button variant="success" onClick={() => handleFinishRepair(repair.RBillNo)} className="ml-2">
                            Finish Repair
                        </Button>
                    </Card.Body>
                </Card>
            ))}

            {/* Add Accessories Modal */}
            <Modal show={showModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Accessories</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {products.map((product, index) => (
                            <div key={index}>
                                <Form.Group controlId={`productName-${index}`}>
                                    <Form.Label>Product Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={product.productName}
                                        onChange={(e) => handleProductChange(index, 'productName', e.target.value)}
                                        list={`product-suggestions-${index}`}
                                    />
                                    <datalist id={`product-suggestions-${index}`}>
                                        {productSuggestions.map((suggestion, idx) => (
                                            <option key={idx} value={suggestion.Name} />
                                        ))}
                                    </datalist>
                                </Form.Group>
                                <Form.Group controlId={`quantity-${index}`}>
                                    <Form.Label>Quantity</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={product.quantity}
                                        onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group controlId={`discount-${index}`}>
                                    <Form.Label>Discount</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={product.discount}
                                        onChange={(e) => handleProductChange(index, 'discount', e.target.value)}
                                    />
                                </Form.Group>
                                <hr />
                            </div>
                        ))}
                        <Button variant="secondary" onClick={handleAddProduct}>
                            Add Another Product
                        </Button>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default TechnicianRepairBill;
