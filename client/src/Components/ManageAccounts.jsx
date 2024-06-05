import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';

const ManageAccounts = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [role, setRole] = useState('');
  const [userDetails, setUserDetails] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    nic: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/manager/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleShow = (type, role) => {
    setModalType(type);
    setRole(role);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setUserDetails({
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      mobile: '',
      email: '',
      nic: ''
    });
  };

  const handleChange = (e) => {
    setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
  };


  const handleSubmit = async () => {
    if (modalType === 'Add') {
      const response = await axios.post('http://localhost:3000/manager/users', { ...userDetails, role });
      alert(`${role} added successfully!`);
    } else if (modalType === 'Update') {
      const response = await axios.put('http://localhost:3000/manager/users', { ...userDetails, role });
      alert(`${role} updated successfully!`);
    } else if (modalType === 'Delete') {
      const response = await axios.delete(`http://localhost:3000/manager/users/${userDetails.username}`);
      alert(`${role} deleted successfully!`);
    }
    fetchUsers();
    handleClose();
  };

  const handleUserSelect = async (username, role) => {
    try {
      const response = await axios.get(`http://localhost:3000/manager/users/${username}`);
      setUserDetails(response.data); // Set user details to the state
      setModalType('Update');
      setRole(role); // Set the role for the selected user
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };
  

  const handleDeleteConfirm = async () => {
    if (window.confirm(`Are you sure you want to delete the ${role}?`)) {
      try {
        await axios.delete(`http://localhost:3000/manager/users/${userDetails.username}`);
        alert(`${role} deleted successfully!`);
        fetchUsers();
        handleClose();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  return (
    <div className="container mt-5">
      <h1>Manage Accounts</h1>
      {['Cashier', 'Store Keeper', 'Technician'].map(role => (
        <div className="card mb-4" key={role}>
          <div className="card-body">
            <h5 className="card-title">{role}</h5>
            <Button variant="primary" onClick={() => handleShow('Add', role)} style={{ marginRight: 6 }}>Add</Button>
            <Button variant="success" onClick={() => handleShow('Update', role)} style={{ marginRight: 6 }}>Update</Button>
            <Button variant="danger" onClick={() => handleShow('Delete', role)} style={{ marginRight: 6 }}>Delete</Button>
          </div>
        </div>
      ))}
s
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{modalType} {role}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === 'Delete' ? (
            <Form.Group controlId="formBasicUsername">
              <Form.Label>Select {role} to Delete</Form.Label>
              <Form.Control as="select" onChange={(e) => setUserDetails({ username: e.target.value })}>
                <option value="">Select...</option>
                {users.filter(user => user.role === role).map(user => (
                  <option key={user.username} value={user.username}>{user.username}</option>
                ))}
              </Form.Control>
            </Form.Group>
          ) : (
            <Form>
              <Form.Group controlId="formBasicUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control type="text" name="username" value={userDetails.username} onChange={handleChange} required />
              </Form.Group>
              <Form.Group controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" name="password" value={userDetails.password} onChange={handleChange} required />
              </Form.Group>
              <Form.Group controlId="formBasicFirstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control type="text" name="firstName" value={userDetails.firstName} onChange={handleChange} required />
              </Form.Group>
              <Form.Group controlId="formBasicLastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control type="text" name="lastName" value={userDetails.lastName} onChange={handleChange} required />
              </Form.Group>
              <Form.Group controlId="formBasicMobile">
                <Form.Label>Mobile</Form.Label>
                <Form.Control type="text" name="mobile" value={userDetails.mobile} onChange={handleChange} required />
              </Form.Group>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" value={userDetails.email} onChange={handleChange} required />
              </Form.Group>
              <Form.Group controlId="formBasicNIC">
                <Form.Label>NIC</Form.Label>
                <Form.Control type="text" name="nic" value={userDetails.nic} onChange={handleChange} required />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
          <Button variant="primary" onClick={modalType === 'Delete' ? handleDeleteConfirm : handleSubmit}>{modalType} {role}</Button>
          </Modal.Footer>
          </Modal>
    </div>
  );
};

export default ManageAccounts;
