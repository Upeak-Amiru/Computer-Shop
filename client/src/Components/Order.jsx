import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';

const Order = () => {
  const [products, setProducts] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [search, setSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [error, setError] = useState('');
  const orderTableRef = useRef(null);

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
    const value = e.target.value;
    if (Number.isInteger(Number(value)) && Number(value) > 0) {
      setQuantity(value);
      setError('');
    } else {
      setError('Please enter a positive integer greater than 0.');
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleOrderSearch = (e) => {
    setOrderSearch(e.target.value);
  };

  const handleOrderDate = (e) => {
    setOrderDate(e.target.value);
  };

  const handleOrderStatus = (e) => {
    setOrderStatus(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quantity || parseInt(quantity) <= 0) {
      setError('Please enter a quantity greater than 0.');
      return;
    }

    try {
      await axios.post('http://localhost:3000/manager/order', {
        ProductCode: selectedProduct.ProductCode,
        Quantity: quantity,
      });
      setSelectedProduct(null);
      setQuantity('');
      fetchProducts();
      fetchOrderList();
      scrollToBottom();
    } catch (error) {
      console.error('Error adding order:', error);
    }
  };

  const handleBack = () => {
    setSelectedProduct(null);
    setQuantity('');
    setError('');
  };

  const scrollToBottom = () => {
    orderTableRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const isProductOrdered = (productCode) => {
    return orderList.some(order => order.ProductCode === productCode && order.OrderStatus !== 'Complete');
  };

  const filteredProducts = products
    .filter((product) => {
      return (
        product.ProductCode.toLowerCase().includes(search.toLowerCase()) ||
        product.Name.toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort((a, b) => {
      const aOrdered = isProductOrdered(a.ProductCode);
      const bOrdered = isProductOrdered(b.ProductCode);
      if (aOrdered && !bOrdered) return 1;
      if (!aOrdered && bOrdered) return -1;
      return 0;
    });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const filteredOrders = orderList.filter((order) => {
    const orderDateMatch = orderDate ? formatDate(order.Date) === orderDate : true;
    const orderStatusMatch = orderStatus ? order.OrderStatus === orderStatus : true;
    return (
      order.ProductCode.toLowerCase().includes(orderSearch.toLowerCase()) &&
      orderDateMatch &&
      orderStatusMatch
    );
  }).sort((a, b) => {
    if (a.OrderStatus === 'Complete' && b.OrderStatus !== 'Complete') return 1;
    if (a.OrderStatus !== 'Complete' && b.OrderStatus === 'Complete') return -1;
    return 0;
  });

  const getRowClass = (orderStatus) => {
    switch (orderStatus) {
      case 'Verified':
        return 'table-warning';
      case 'Complete':
        return 'table-success';
      case 'Cancelled':
        return 'table-danger';
      default:
        return '';
    }
  };

  return (
    <div className="container mt-4">
      <h2>Order Products</h2>
      <Link to="/managerdashboard/order/orderproperties" className="btn btn-outline-primary mb-3 rounded-3 text-end">
        Properties
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
          {filteredProducts.map((product) => (
            <tr
              key={product.ProductCode}
              onClick={() => handleProductClick(product)}
              className={isProductOrdered(product.ProductCode) ? 'table-info' : ''}
            >
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
          <button type="button" className="btn btn-secondary mt-3 ms-3" onClick={handleBack}>Back</button>
        </form>
      )}

      <h3 className="mt-4">Order List</h3>
      <div className="row mb-3">
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Product Code"
            value={orderSearch}
            onChange={handleOrderSearch}
          />
        </div>
        <div className="col-md-3">
          <input
            type="date"
            className="form-control"
            value={orderDate}
            onChange={handleOrderDate}
          />
        </div>
        <div className="col-md-3">
          <select className="form-control" value={orderStatus} onChange={handleOrderStatus}>
            <option value="">All Statuses</option>
            <option value="Ordered">Ordered</option>
            <option value="Verified">Verified</option>
            <option value="Complete">Complete</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      <table className="table table-bordered">
        <thead className="thead-dark">
          <tr>
            <th>Product Code</th>
            <th>Name</th>
            <th>Order Quantity</th>
            <th>Date</th>
            <th>Order Status</th>
            
          </tr>
        </thead>
        <tbody ref={orderTableRef}>
          {filteredOrders.map((order) => (
            <tr key={order.NotificationNo} className={getRowClass(order.OrderStatus)}>
              <td>{order.ProductCode}</td>
              <td>{order.Name}</td>
              <td>{order.Quantity}</td>
              <td>{formatDate(order.Date)}</td>
              <td>{order.OrderStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Order;
