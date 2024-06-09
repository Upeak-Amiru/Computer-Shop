// src/Inventory.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get('http://localhost:3000/manager/inventory');
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleFilter = (e) => {
    setFilter(e.target.value);
  };

  const filteredProducts = products
    .filter((product) => {
      return (
        product.ProductCode.toLowerCase().includes(search.toLowerCase()) ||
        product.Name.toLowerCase().includes(search.toLowerCase())
      );
    })
    .filter((product) => {
      if (filter === '') return true;
      if (filter === 'less10') return product.Quantity < 10;
      if (filter === 'less20') return product.Quantity < 20;
      if (filter === 'eq20') return product.Quantity >= 20;
      return true;
    });

  return (
    <div className="container mt-4">
      <h2>Inventory Status</h2>
      <div className="row mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Product Code or Name"
            value={search}
            onChange={handleSearch}
          />
        </div>
        <div className="col-md-4">
          <select className="form-control" value={filter} onChange={handleFilter}>
            <option value="">Filter by Quantity</option>
            <option value="less10">Less than 10</option>
            <option value="less20">Less than 20</option>
            <option value="eq20">Equal or above 20</option>
          </select>
        </div>
      </div>
      <table className="table table-bordered">
        <thead className="thead-dark">
          <tr>
            <th>Product Code</th>
            <th>Name</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Warranty Detail</th>
            <th>Sell Price</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts
            .filter((product) => product.Quantity > 0) // Filter out products with quantity 0
            .map((product) => (
              <tr key={product.ProductCode}>
                <td>{product.ProductCode}</td>
                <td>{product.Name}</td>
                <td>{product.Description}</td>
                <td>{product.Quantity}</td>
                <td>{product.WarrantyDetail}</td>
                <td>{product.SellingPrice}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inventory;
