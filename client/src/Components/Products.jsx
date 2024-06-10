import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form, Modal, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [currentProduct, setCurrentProduct] = useState({
    ProductCode: '',
    Name: '',
    Description: '',
    Quantity: 0,
    MinQuantity: 10,
    WarrantyDetail: '',
    SellingPrice: '',
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/storekeeper/products');
      setProducts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`http://localhost:3000/storekeeper/products?search=${searchTerm}`);
      setProducts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddProduct = async () => {
    try {
      await axios.post('http://localhost:3000/storekeeper/products', currentProduct);
      fetchProducts();
      setShowModal(false);
      setAlertMessage('Product added successfully');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  const handleUpdateProduct = async () => {
    try {
      await axios.put(`http://localhost:3000/storekeeper/products/${currentProduct.ProductCode}`, currentProduct);
      fetchProducts();
      setShowModal(false);
      setAlertMessage('Product updated successfully');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  const handleDeleteProduct = async (productCode) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:3000/storekeeper/products/${productCode}`);
        fetchProducts();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const openModal = (type, product = {}) => {
    setModalType(type);
    setCurrentProduct({
      ProductCode: product.ProductCode || '',
      Name: product.Name || '',
      Description: product.Description || '',
      Quantity: product.Quantity || 0,
      MinQuantity: product.MinQuantity || 10,
      WarrantyDetail: product.WarrantyDetail || '',
      SellingPrice: product.SellingPrice || '',
    });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  return (
    <div className="container mt-4">
      <h2>Products</h2>
      <Form onSubmit={handleSearch} className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search by Product Code or Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form>
      <Button onClick={() => openModal('add')} className="mb-3">Add Product</Button>
      {showAlert && <Alert variant="success">{alertMessage}</Alert>}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ProductCode</th>
            <th>Name</th>
            <th>Description</th>
            <th>Warranty Detail</th>
            <th>Selling Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.ProductCode}
            >
              <td 
              style={{
                backgroundColor:
                product.MinQuantity === 0
                    ? '#768796'
                    : '',
              }}>{product.ProductCode}</td>
              <td
              style={{
                backgroundColor:
                product.MinQuantity === 0
                    ? '#768796'
                    : '',
              }}>{product.Name}</td>
              <td
              style={{
                backgroundColor:
                product.MinQuantity === 0
                    ? '#768796'
                    : '',
              }}>{product.Description}</td>
              <td 
              style={{
                backgroundColor:
                product.MinQuantity === 0
                    ? '#768796'
                    : '',
              }}>{product.WarrantyDetail}</td>
              <td 
              style={{
                backgroundColor:
                product.MinQuantity === 0
                    ? '#768796'
                    : '',
              }}>{product.SellingPrice}</td>
              <td
              
              style={{
                backgroundColor:
                product.MinQuantity === 0
                    ? '#768796'
                    : '',
              }}>
              {product.MinQuantity !== 0 && (
                  <>
                    <Button
                      onClick={() => openModal('edit', product)}
                      className="me-2"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteProduct(product.ProductCode)}
                      variant="danger"
                    >
                      Delete
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{modalType === 'add' ? 'Add Product' : 'Edit Product'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formProductCode">
              <Form.Label>Product Code</Form.Label>
              <Form.Control
                type="text"
                value={currentProduct.ProductCode}
                onChange={(e) =>
                  setCurrentProduct({ ...currentProduct, ProductCode: e.target.value })
                }
                disabled={modalType === 'edit'}
              />
            </Form.Group>
            <Form.Group controlId="formName" className="mt-2">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={currentProduct.Name}
                onChange={(e) =>
                  setCurrentProduct({ ...currentProduct, Name: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="formDescription" className="mt-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                value={currentProduct.Description}
                onChange={(e) =>
                  setCurrentProduct({ ...currentProduct, Description: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="formWarrantyDetail" className="mt-2">
              <Form.Label>Warranty Detail</Form.Label>
              <Form.Control
                type="text"
                value={currentProduct.WarrantyDetail}
                onChange={(e) =>
                  setCurrentProduct({ ...currentProduct, WarrantyDetail: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="formSellingPrice" className="mt-2">
              <Form.Label>Selling Price</Form.Label>
              <Form.Control
                type="text"
                value={currentProduct.SellingPrice}
                onChange={(e) =>
                  setCurrentProduct({ ...currentProduct, SellingPrice: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={modalType === 'add' ? handleAddProduct : handleUpdateProduct}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Products;
