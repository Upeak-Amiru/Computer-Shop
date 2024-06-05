// src/StoreKeeperOrder.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const StoreKeeperOrder = () => {
  const [requestedOrders, setRequestedOrders] = useState([]);
  const [verifiedOrders, setVerifiedOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequestedOrders();
    fetchVerifiedOrders();
  }, []);

  const fetchRequestedOrders = async () => {
    try {
      const response = await axios.get('http://localhost:3000/storekeeper/orders');
      if (response.data.success) {
        setRequestedOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching requested orders:', error);
    }
  };
  const fetchVerifiedOrders = async () => {
    try {
      const response = await axios.get('http://localhost:3000/storekeeper/orders/verified');
      if (response.data.success) {
        setVerifiedOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching verified orders:', error);
      setError('Error fetching verified orders');
    }
  };

  const handleVerifyOrder = async (notificationNo) => {
    try {
      await axios.put(`http://localhost:3000/storekeeper/order/verify/${notificationNo}`);
      fetchRequestedOrders();
    } catch (error) {
      console.error('Error verifying order:', error);
    }
  };

  const handleCancelOrder = async (notificationNo) => {
    try {
      await axios.put(`http://localhost:3000/storekeeper/order/cancel/${notificationNo}`);
      fetchRequestedOrders();
    } catch (error) {
      console.error('Error canceling order:', error);
    }
  };
  const handleCompleteOrder = async (notificationNo) => {
    try {
      await axios.put(`http://localhost:3000/storekeeper/order/complete/${notificationNo}`);
      fetchVerifiedOrders();
    } catch (error) {
      console.error('Error completing order:', error);
      setError('Error completing order');
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
      <h2>Requested Orders</h2>
      <table className="table table-bordered">
        <thead className="thead-dark">
          <tr>
            
            <th>Date</th>
            <th>Product Code</th>
            <th>Name</th>
            <th>Quantity</th>
            <th>Supplier Name</th>
            <th>Mobile</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requestedOrders.map((order) => (
            <tr key={order.NotificationNo}>
              
              <td>{formatDate(order.Date)}</td>
              <td>{order.ProductCode}</td>
              <td>{order.Name}</td>
              <td>{order.Quantity}</td>
              <td>{`${order.FirstName} ${order.LastName}`}</td>
              <td>{order.Mobile}</td>
              <td>{order.Email}</td>
              <td>
                {order.OrderStatus === 'Ordered' && (
                  <>
                    <button className="btn btn-primary m-3 rounded-3" onClick={() => handleVerifyOrder(order.NotificationNo)}>
                      Verify
                    </button>
                    <button className="btn btn-danger rounded-3" onClick={() => handleCancelOrder(order.NotificationNo)}>
                      Cancel
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Verified Orders</h2>
      <table className="table table-bordered">
        <thead className="thead-dark">
          <tr>
            <th>Notification No</th>
            <th>Product Code</th>
            <th>Name</th>
            <th>Quantity</th>
            <th>Verified Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {verifiedOrders.map((order) => (
            <tr key={order.NotificationNo}>
              <td>{order.NotificationNo}</td>
              <td>{order.ProductCode}</td>
              <td>{order.Name}</td>
              <td>{order.Quantity}</td>
              <td>{formatDate(order.VerifiedDate)}</td>
              <td>
                <button className="btn btn-primary" onClick={() => handleCompleteOrder(order.NotificationNo)}>
                  Complete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </div>
  );
};

export default StoreKeeperOrder;

