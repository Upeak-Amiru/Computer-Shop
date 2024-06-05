// src/OrderProperties.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';

const OrderProperties = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [newMinQuantity, setNewMinQuantity] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/manager/products');
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const startEditing = (product) => {
    setEditingProduct(product.ProductCode);
    setNewMinQuantity(product.MinQuantity);
  };

  const saveMinQuantity = async (productCode) => {
    if (!Number.isInteger(Number(newMinQuantity)) || Number(newMinQuantity) <= 1) {
      setError('Min Quantity must be an integer greater than 1');
      return;
    }

    try {
      await axios.put(`http://localhost:3000/manager/product/${productCode}`, {
        minQuantity: newMinQuantity,
      });
      setEditingProduct(null);
      setError('');
      fetchProducts();
    } catch (error) {
      console.error('Error updating MinQuantity:', error);
    }
  };

  const filteredProducts = products.filter((product) => {
    return (
      (product.ProductCode.toLowerCase().includes(search.toLowerCase()) ||
        product.Name.toLowerCase().includes(search.toLowerCase())) &&
      product.MinQuantity !== 0 // Filter out products with MinQuantity 0
    );
  });

  return (
    <div className="container mt-4">
      <h2>Product Properties</h2>
      <Link to="/managerdashboard/order" className="btn btn-outline-primary mb-3 rounded-3">
        Go Back to Order
      </Link>
      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Product Code or Name"
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <table className="table table-bordered">
        <thead className="thead-dark">
          <tr>
            <th>Product Code</th>
            <th>Name</th>
            <th>Min Quantity</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product.ProductCode}>
              <td>{product.ProductCode}</td>
              <td>{product.Name}</td>
              <td className="d-flex justify-content-between align-items-center">
                {editingProduct === product.ProductCode ? (
                  <input
                    type="number"
                    value={newMinQuantity}
                    onChange={(e) => setNewMinQuantity(e.target.value)}
                    className="form-control"
                  />
                ) : (
                  product.MinQuantity
                )}
                {editingProduct === product.ProductCode ? (
                  <button
                    className="btn btn-success ml-2"
                    onClick={() => saveMinQuantity(product.ProductCode)}
                  >
                    Save
                  </button>
                ) : (
                  <button
                    className="btn btn-primary ml-2"
                    onClick={() => startEditing(product)}
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderProperties;
