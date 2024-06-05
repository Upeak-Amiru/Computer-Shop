// src/Order.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';

const Order = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [orderList, setOrderList] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchOrderList();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/manager/orders');
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrderList = async () => {
    try {
      const response = await axios.get('http://localhost:3000/manager/orderlist');
      if (response.data.success) {
        setOrderList(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching order list:', error);
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setQuantity('');
    setError('');
  };

  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
      setError('Quantity must be a positive integer greater than 0');
      return;
    }

    try {
      await axios.post('http://localhost:3000/manager/order', {
        ProductCode: selectedProduct.ProductCode,
        Quantity: quantity,
      });
      setSelectedProduct(null);
      setQuantity('');
      fetchOrderList();
    } catch (error) {
      console.error('Error submitting order:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  return (
    <div className="container mt-4">
      <h2>Order Products</h2>
      <Link to="/managerdashboard/order/orderproperties" className="btn btn-outline-primary mb-3 rounded-3 text-end">
        Properties
      </Link>
      <table className="table table-bordered">
        <thead className="thead-dark">
          <tr>
            <th>Product Code</th>
            <th>Name</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Purchase Price</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.ProductCode} onClick={() => handleProductClick(product)}>
              <td>{product.ProductCode}</td>
              <td>{product.Name}</td>
              <td>{product.Description}</td>
              <td>{product.Quantity}</td>
              <td>{product.PurchasePrice}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedProduct && (
        <form onSubmit={handleSubmit} className="mt-4">
          <h3>Order Product</h3>
          <div className="form-group">
            <label>Product Code</label>
            <input type="text" className="form-control" value={selectedProduct.ProductCode} readOnly />
          </div>
          <div className="form-group">
            <label>Product Name</label>
            <input type="text" className="form-control" value={selectedProduct.Name} readOnly />
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input type="number" className="form-control" value={quantity} onChange={handleQuantityChange} />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <button type="submit" className="btn btn-primary mt-3">Enter</button>
        </form>
      )}

      <h3 className="mt-4">Order List</h3>
      <table className="table table-bordered">
        <thead className="thead-dark">
          <tr>
            <th>Date</th>
            <th>Product Code</th>
            <th>Quantity</th>
            <th>Order Status</th>
          </tr>
        </thead>
        <tbody>
          {orderList.map((order) => (
            <tr key={order.NotificationNo}>
              <td>{formatDate(order.Date)}</td>
              <td>{order.ProductCode}</td>
              <td>{order.Quantity}</td>
              <td>{order.OrderStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Order;

