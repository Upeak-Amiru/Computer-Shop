import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Container, Card } from 'react-bootstrap';

const CashierShowRepairs = () => {
    const [repairs, setRepairs] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:3000/cashier/getRepairs')
            .then(response => setRepairs(response.data))
            .catch(error => console.error(error));
    }, []);

    return (
        <Container>
            <Card className="my-3 p-3">
                <Card.Body>
                    <h4>Repairs</h4>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Customer Name</th>
                                <th>Customer Mobile</th>
                                <th>Date</th>
                                <th>Product Name</th>
                                <th>Advance</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {repairs.map((repair, index) => (
                                <tr key={index}>
                                    <td>{repair.customerName}</td>
                                    <td>{repair.customerMobile}</td>
                                    <td>{repair.Date}</td>
                                    <td>{repair.productName}</td>
                                    <td>{repair.Advance}</td>
                                    <td>{repair.status === 0 ? 'Pending' : 'Completed'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CashierShowRepairs;
