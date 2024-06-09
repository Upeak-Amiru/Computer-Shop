import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Table, Form, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [products, setProducts] = useState([]);
    const [showProductsModal, setShowProductsModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [newSupplier, setNewSupplier] = useState({
        FirstName: '',
        LastName: '',
        Mobile: '',
        Email: '',
        NIC: '',
        Products: [{ ProductCode: '', ProductName: '', PurchasePrice: '' }]
    });
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = () => {
        axios.get('http://localhost:3000/storekeeper/suppliers')
            .then(response => setSuppliers(response.data))
            .catch(error => console.error('Error fetching suppliers:', error));
    };

    const showProducts = (supplier) => {
        setSelectedSupplier(supplier);
        axios.get(`http://localhost:3000/storekeeper/suppliers/${supplier.Username}/products`)
            .then(response => {
                setProducts(response.data);
                setShowProductsModal(true);
            })
            .catch(error => console.error('Error fetching products:', error));
    };

    const handleAddSupplier = () => {
        setNewSupplier({
            FirstName: '',
            LastName: '',
            Mobile: '',
            Email: '',
            NIC: '',
            Products: [{ ProductCode: '', ProductName: '', PurchasePrice: '' }]
        });

        axios.post('http://localhost:3000/storekeeper/suppliers/check', { NIC: newSupplier.NIC, Mobile: newSupplier.Mobile })
            .then(response => {
                if (response.data.exists) {
                    setAlert('This supplier already exists.');
                    return;
                } else if (response.data.reinstated) {
                    setAlert('Supplier reinstated successfully');
                    fetchSuppliers();
                    setShowAddModal(false);
                    return;
                }

                axios.post('http://localhost:3000/storekeeper/suppliers/add', newSupplier)
                    .then(response => {
                        setAlert('Supplier added successfully');
                        setShowAddModal(false);
                        fetchSuppliers();
                    })
                    .catch(error => console.error('Error adding supplier:', error));
            })
            .catch(error => console.error('Error checking supplier:', error));
    };

    const handleEditSupplier = (supplier) => {
        axios.get(`http://localhost:3000/storekeeper/suppliers/${supplier.Username}`)
            .then(response => {
                setNewSupplier(response.data);
                setShowUpdateModal(true);
            })
            .catch(error => console.error('Error fetching supplier details:', error));
    };

    const handleUpdateSupplier = () => {
        axios.put(`http://localhost:3000/storekeeper/suppliers/${newSupplier.Username}`, newSupplier)
            .then(response => {
                setAlert('Supplier details updated successfully');
                setShowUpdateModal(false);
                fetchSuppliers();
            })
            .catch(error => console.error('Error updating supplier:', error));
    };

    const handleDeleteSupplier = (username) => {
        axios.put(`http://localhost:3000/storekeeper/suppliers/${username}/delete`)
            .then(response => {
                setAlert('Supplier deleted successfully');
                fetchSuppliers();
            })
            .catch(error => console.error('Error deleting supplier:', error));
    };

    const handleChange = (index, field, value) => {
        const updatedProducts = [...newSupplier.Products];
        updatedProducts[index][field] = value;

        if (field === 'ProductCode' || field === 'ProductName') {
            const queryField = field === 'ProductCode' ? 'ProductCode' : 'Name';
            axios.get(`http://localhost:3000/storekeeper/products/${queryField}/${value}`)
                .then(response => {
                    if (field === 'ProductCode') {
                        updatedProducts[index].ProductName = response.data.Name || '';
                    } else {
                        updatedProducts[index].ProductCode = response.data.ProductCode || '';
                    }
                    setNewSupplier({ ...newSupplier, Products: updatedProducts });
                })
                .catch(error => console.error('Error fetching product details:', error));
        } else {
            setNewSupplier({ ...newSupplier, Products: updatedProducts });
        }
    };

    const addProductField = () => {
        setNewSupplier({
            ...newSupplier,
            Products: [...newSupplier.Products, { ProductCode: '', ProductName: '', PurchasePrice: '' }]
        });
    };

    const removeProductField = (index) => {
        const updatedProducts = newSupplier.Products.filter((_, i) => i !== index);
        setNewSupplier({ ...newSupplier, Products: updatedProducts });
    };

    return (
        <div className="container mt-4">
            <Button variant="success" onClick={() => setShowAddModal(true)} className='rounded-3'>Add Supplier</Button>
            {alert && <Alert variant="success" onClose={() => setAlert(null)} dismissible>{alert}</Alert>}

            <Table striped bordered hover className="mt-4 rounded-3 overflow-hidden">
                <thead>
                    <tr className='table-success'>
                        <th>Username</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Mobile</th>
                        <th>Email</th>
                        <th>NIC</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {suppliers.map((supplier) => (
                        <tr key={supplier.Username}>
                            <td>{supplier.Username}</td>
                            <td>{supplier.FirstName}</td>
                            <td>{supplier.LastName}</td>
                            <td>{supplier.Mobile}</td>
                            <td>{supplier.Email}</td>
                            <td>{supplier.NIC}</td>
                            <td>
                                <Button variant="info" onClick={() => showProducts(supplier)} className="mr-2 rounded-3">View Products</Button>
                                <Button variant="warning" onClick={() => handleEditSupplier(supplier)} className="mr-2 rounded-3">Edit</Button>
                                <Button variant="danger" onClick={() => handleDeleteSupplier(supplier.Username)} className="rounded-3">Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Products Modal */}
            <Modal show={showProductsModal} onHide={() => setShowProductsModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Products</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Product Code</th>
                                <th>Product Name</th>
                                <th>Purchase Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.ProductCode}>
                                    <td>{product.ProductCode}</td>
                                    <td>{product.ProductName}</td>
                                    <td>{product.PurchasePrice}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowProductsModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* Add Supplier Modal */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Supplier</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formFirstName">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter first name"
                                value={newSupplier.FirstName}
                                onChange={(e) => setNewSupplier({ ...newSupplier, FirstName: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formLastName">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter last name"
                                value={newSupplier.LastName}
                                onChange={(e) => setNewSupplier({ ...newSupplier, LastName: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formMobile">
                            <Form.Label>Mobile</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter mobile number"
                                value={newSupplier.Mobile}
                                onChange={(e) => setNewSupplier({ ...newSupplier, Mobile: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter email"
                                value={newSupplier.Email}
                                onChange={(e) => setNewSupplier({ ...newSupplier, Email: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formNIC">
                            <Form.Label>NIC</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter NIC"
                                value={newSupplier.NIC}
                                onChange={(e) => setNewSupplier({ ...newSupplier, NIC: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formProducts">
                            <Form.Label>Products</Form.Label>
                            {newSupplier.Products.map((product, index) => (
                                <Row key={index} className="mb-2">
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            placeholder="Product Code"
                                            value={product.ProductCode}
                                            onChange={(e) => handleChange(index, 'ProductCode', e.target.value)}
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            placeholder="Product Name"
                                            value={product.ProductName}
                                            onChange={(e) => handleChange(index, 'ProductName', e.target.value)}
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="number"
                                            placeholder="Purchase Price"
                                            value={product.PurchasePrice}
                                            onChange={(e) => handleChange(index, 'PurchasePrice', e.target.value)}
                                        />
                                    </Col>
                                    <Col>
                                        <Button variant="danger" onClick={() => removeProductField(index)}>Remove</Button>
                                    </Col>
                                </Row>
                            ))}
                            <Button variant="primary" onClick={addProductField}>Add Product</Button>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>Close</Button>
                    <Button variant="primary" onClick={handleAddSupplier}>Add Supplier</Button>
                </Modal.Footer>
            </Modal>

            {/* Update Supplier Modal */}
            <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Supplier</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formFirstName">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter first name"
                                value={newSupplier.FirstName}
                                onChange={(e) => setNewSupplier({ ...newSupplier, FirstName: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formLastName">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter last name"
                                value={newSupplier.LastName}
                                onChange={(e) => setNewSupplier({ ...newSupplier, LastName: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formMobile">
                            <Form.Label>Mobile</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter mobile number"
                                value={newSupplier.Mobile}
                                onChange={(e) => setNewSupplier({ ...newSupplier, Mobile: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter email"
                                value={newSupplier.Email}
                                onChange={(e) => setNewSupplier({ ...newSupplier, Email: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formNIC">
                            <Form.Label>NIC</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter NIC"
                                value={newSupplier.NIC}
                                onChange={(e) => setNewSupplier({ ...newSupplier, NIC: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formProducts">
                            <Form.Label>Products</Form.Label>
                            {newSupplier.Products.map((product, index) => (
                                <Row key={index} className="mb-2">
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            placeholder="Product Code"
                                            value={product.ProductCode}
                                            onChange={(e) => handleChange(index, 'ProductCode', e.target.value)}
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            placeholder="Product Name"
                                            value={product.ProductName}
                                            onChange={(e) => handleChange(index, 'ProductName', e.target.value)}
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="number"
                                            placeholder="Purchase Price"
                                            value={product.PurchasePrice}
                                            onChange={(e) => handleChange(index, 'PurchasePrice', e.target.value)}
                                        />
                                    </Col>
                                    <Col>
                                        <Button variant="danger" onClick={() => removeProductField(index)}>Remove</Button>
                                    </Col>
                                </Row>
                            ))}
                            <Button variant="primary" onClick={addProductField}>Add Product</Button>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>Close</Button>
                    <Button variant="primary" onClick={handleUpdateSupplier}>Update Supplier</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Suppliers;
