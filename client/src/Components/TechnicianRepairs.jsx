import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Container, Card, Modal, Button, Form } from 'react-bootstrap';

const TechnicianRepairs = () => {
    const [repairs, setRepairs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentRepair, setCurrentRepair] = useState(null);
    const [description, setDescription] = useState('');
    const [technicianCost, setTechnicianCost] = useState('');
    const [repairStatus, setRepairStatus] = useState('Waiting');

    useEffect(() => {
        axios.get('http://localhost:3000/technician/getRepairs')
            .then(response => setRepairs(response.data))
            .catch(error => console.error(error));
    }, []);

    const handleRepairJobClick = (repair) => {
        axios.get(`http://localhost:3000/technician/getRepairJob/${repair.RBillNo}`)
            .then(response => {
                const job = response.data;
                setCurrentRepair(repair);
                setDescription(job.Description || '');
                setTechnicianCost(job.TechnicianCost || '');
                setRepairStatus(job.RepairStatus || 'Waiting');
                setShowModal(true);
            })
            .catch(error => console.error(error));
    };

    const handleModalClose = () => {
        setShowModal(false);
        setCurrentRepair(null);
        setDescription('');
        setTechnicianCost('');
        setRepairStatus('Waiting');
    };

    const handleSave = () => {
        const { RBillNo } = currentRepair;
        axios.post('http://localhost:3000/technician/updateRepairJob', {
            rBillNo: RBillNo,
            description,
            technicianCost,
            repairStatus
        })
        .then(response => {
            alert(response.data.message);
            handleModalClose();
            // Refresh the repairs list after saving
            return axios.get('http://localhost:3000/technician/getRepairs');
        })
        .then(response => setRepairs(response.data))
        .catch(error => {
            console.error("Error saving repair job: ", error);
            alert('There was an error saving the repair job. Please try again.');
        });
    };

    const handleFinishRepair = (repair) => {
        axios.post('http://localhost:3000/technician/finishRepair', { rBillNo: repair.RBillNo })
            .then(response => {
                alert(response.data.message);
                setRepairs(repairs.filter(r => r.RBillNo !== repair.RBillNo));
            })
            .catch(error => {
                console.error("Error finishing repair: ", error);
                alert('There was an error finishing the repair. Please try again.');
            });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getRowStyle = (repairStatus => {
        switch (repairStatus) {
            case 'Waiting':
              return 'table-danger';
            case 'Processing':
              return 'table-warning';
            case 'Finished':
              return 'table-success';
            default:
              return '';
        }
    });

    return (
        <Container>
            <Card className="my-3 p-3">
                <Card.Body>
                    <h4>Repair List</h4>
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
                                <tr key={index} className={getRowStyle(repair.RepairStatus)}>
                                    <td>{repair.CustomerName}</td>
                                    <td>{repair.CustomerMobile}</td>
                                    <td>{formatDate(repair.Date)}</td>
                                    <td>{repair.ProductName}</td>
                                    <td>{repair.Advance}</td>
                                    <td>
                                        {repair.RepairStatus !== 'Finished' && (
                                            <Button variant="info" onClick={() => handleRepairJobClick(repair)}>
                                                Repair Job
                                            </Button>
                                        )}
                                       
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Update Modal */}
            <Modal show={showModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Repair Job</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="description">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="technicianCost">
                            <Form.Label>Technician Cost</Form.Label>
                            <Form.Control
                                type="number"
                                value={technicianCost}
                                onChange={(e) => setTechnicianCost(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="repairStatus">
                            <Form.Label>Repair Status</Form.Label>
                            <Form.Control
                                as="select"
                                value={repairStatus}
                                onChange={(e) => setRepairStatus(e.target.value)}
                            >
                                <option value="Waiting">Waiting</option>
                                <option value="Processing">Processing</option>
                                
                            </Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Update
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default TechnicianRepairs;
