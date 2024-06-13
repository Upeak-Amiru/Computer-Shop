import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Container, Card, Button, Modal, Row, Col } from 'react-bootstrap';

const CashierShowRepairs = () => {
    const [repairs, setRepairs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [billDetails, setBillDetails] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:3000/cashier/getRepairs')
            .then(response => setRepairs(response.data))
            .catch(error => console.error(error));
    }, []);

    const handleGenerateBill = (repair) => {
        axios.post('http://localhost:3000/cashier/generateBill', { rBillNo: repair.RBillNo })
            .then(response => {
                setBillDetails(response.data);
                setShowModal(true);
            })
            .catch(error => {
                console.error("Error generating bill: ", error);
                alert('There was an error generating the bill. Please try again.');
            });
    };

    const handleModalClose = () => {
        setShowModal(false);
        setBillDetails(null);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getRowStyle = (repair) => {
        return repair.RepairStatus === 'Finished' ? { backgroundColor: '#d4edda' } : {};
    };

    return (
        <Container>
            <Card className="my-3 p-3">
                <Card.Body>
                    <h4>Repairs List</h4>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Customer Name</th>
                                <th>Customer Mobile</th>
                                <th>Date</th>
                                <th>Product Name</th>
                                <th>Advance</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {repairs.map((repair, index) => (
                                <tr key={index} style={getRowStyle(repair)}>
                                    <td>{repair.CustomerName}</td>
                                    <td>{repair.CustomerMobile}</td>
                                    <td>{formatDate(repair.Date)}</td>
                                    <td>{repair.ProductName}</td>
                                    <td>{repair.Advance}</td>
                                    <td>
                                        {repair.RepairStatus === 'Finished' && (
                                            <Button variant="success" onClick={() => handleGenerateBill(repair)}>
                                                Generate Bill
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Bill Modal */}
            <Modal show={showModal} onHide={handleModalClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Repair Bill</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {billDetails && (
                        <div>
                            <Card>
                                <Card.Header as="h5">Bill Summary</Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col><strong>Bill No:</strong> {billDetails.BillNo}</Col>
                                        <Col><strong>Date:</strong> {formatDate(billDetails.Date)}</Col>
                                        <Col><strong>Time:</strong> {billDetails.Time}</Col>
                                    </Row>
                                    <Row>
                                        <Col><strong>Customer Name:</strong> {billDetails.CustomerName}</Col>
                                        <Col><strong>Customer Mobile:</strong> {billDetails.CustomerMobile}</Col>
                                    </Row>
                                    <Row>
                                        <Col><strong>Description:</strong> {billDetails.Description}</Col>
                                    </Row>
                                    <Row>
                                        <Col><strong>Repair Cost:</strong> Rs.{billDetails.TechnicianCost}</Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                            <Card className="mt-3">
                                <Card.Header as="h5">Accessories Used</Card.Header>
                                <Card.Body>
                                    <Table bordered>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Quantity</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {billDetails.Accessories.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.Name}</td>
                                                    <td>{item.Quantity}</td>
                                                    <td>Rs.{item.Amount.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                            <Card className="mt-3">
                                <Card.Body>
                                    <Row>
                                        <Col><strong>Full Amount:</strong> Rs.{billDetails.FullAmount.toFixed(2)}</Col>
                                    </Row>
                                    <Row>
                                        <Col><strong>Advance:</strong> Rs.{billDetails.Advance}</Col>
                                    </Row>
                                    <Row>
                                        <Col><strong>Remaining Amount:</strong> Rs.{billDetails.RemainingAmount.toFixed(2)}</Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default CashierShowRepairs;
