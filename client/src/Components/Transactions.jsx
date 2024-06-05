import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Transactions = () => {
  const [customer, setCustomer] = useState({ name: '', mobile: '' });
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [bill, setBill] = useState({ products: [], totalDiscount: 0, totalPrice: 0 });
  const [billNo, setBillNo] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    // Fetch Bill No and Date
    axios.get('http://localhost:3000/cashier/new-bill')
      .then(response => {
        setBillNo(response.data.billNo);
        setDate(response.data.date);
      });
  }, []);

  const handleProductChange = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;

    if (field === 'name' || field === 'code') {
        axios.get(`http://localhost:3000/cashier/products?query=${value}`)
            .then(response => {
                setSuggestions(response.data);
            })
            .catch(error => {
                console.error('Error fetching product suggestions:', error);
            });
    }

    if (field === 'code' && value) {
        axios.get(`http://localhost:3000/cashier/product/code/${value}`)
            .then(response => {
                if (response.data.quantity > 0) {
                    newProducts[index] = { ...newProducts[index], ...response.data };
                    setSuggestions([]);
                } else {
                    alert('Out of stock');
                }
                setProducts(newProducts);
            })
            .catch(error => {
                console.error('Error fetching product by code:', error);
            });
    } else if (field === 'name' && value) {
        axios.get(`http://localhost:3000/cashier/product/name/${value}`)
            .then(response => {
                if (response.data.length > 0) {
                    setSuggestions(response.data);
                    newProducts[index] = { ...newProducts[index], ...response.data[0] };
                } else {
                    alert('No products found');
                }
                setProducts(newProducts);
            })
            .catch(error => {
                console.error('Error fetching product by name:', error);
            });
    } else {
        setProducts(newProducts);
    }
};

  const handleAddProduct = () => {
    setProducts([...products, { code: '', name: '', price: 0, discount: 0, quantity: 1, discountType: 'amount' }]);
  };

  const handleCustomerChange = (field, value) => {
    setCustomer({ ...customer, [field]: value });
  };

  const handleBillGeneration = () => {
    // Calculate totals
    let totalDiscount = 0;
    let totalPrice = 0;

    products.forEach(product => {
      const discount = product.discountType === 'percentage'
        ? (product.discount / 100) * product.price
        : product.discount;

      const amount = (product.price - discount) * product.quantity;

      totalDiscount += discount * product.quantity;
      totalPrice += amount;

      product.total = amount;
      product.discount = discount;
    });

    setBill({ products, totalDiscount, totalPrice });
  };
  const handleProductBlur = (index, field, value) => {
    if (field === 'code') {
      axios.get(`http://localhost:3000/cashier/product/code/${value}`)
        .then(response => {
          if (response.data.quantity > 0) {
            const newProducts = [...products];
            newProducts[index] = { ...newProducts[index], ...response.data };
            setProducts(newProducts);
            setSuggestions([]);
          } else {
            alert('Out of stock');
          }
        })
        .catch(error => {
          console.error('Error fetching product by code:', error);
        });
    } else if (field === 'name') {
      axios.get(`http://localhost:3000/cashier/product/name/${value}`)
        .then(response => {
          if (response.data.length > 0) {
            const newProducts = [...products];
            newProducts[index] = { ...newProducts[index], ...response.data[0] };
            setProducts(newProducts);
            setSuggestions([]);
          } else {
            alert('No products found');
          }
        })
        .catch(error => {
          console.error('Error fetching product by name:', error);
        });
    }
  };
  {suggestions.length > 0 && (
    <ul className="list-group">
      {suggestions.map((suggestion, i) => (
        <li
          key={i}
          className="list-group-item"
          onClick={() => handleSuggestionClick(index, suggestion)}
        >
          {suggestion.name}
        </li>
      ))}
    </ul>
  )}
  const handleSuggestionClick = (index, suggestion) => {
    const newProducts = [...products];
    newProducts[index] = {
      ...newProducts[index],
      code: suggestion.code,
      name: suggestion.name,
      price: suggestion.price,
      quantity: 1,
      discount: 0,
      discountType: 'amount',
    };
    setProducts(newProducts);
    setSuggestions([]);
  };
    
  const handleSaveBill = () => {
    const billData = {
      customer,
      billNo,
      date,
      products: bill.products,
      totalDiscount: bill.totalDiscount,
      totalPrice: bill.totalPrice,
    };

    axios.post('http://localhost:3000/cashier/save-bill', billData)
      .then(response => {
        console.log('Bill saved successfully');
      })
      .catch(error => {
        console.error('Error saving bill:', error);
      });
  };

  return (
    <div className="container mt-4">
      <h2>Cashier Dashboard</h2>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Customer Details</h5>
          <div className="row">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Customer Name"
                value={customer.name}
                onChange={(e) => handleCustomerChange('name', e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Customer Mobile"
                value={customer.mobile}
                onChange={(e) => handleCustomerChange('mobile', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Products</h5>
          {products.map((product, index) => (
            <div key={index} className="row mb-2">
              <div className="col-md-2">
              <input
  type="text"
  className="form-control"
  placeholder="Product Code"
  value={product.code}
  onChange={(e) => handleProductChange(index, 'code', e.target.value)}
  onBlur={(e) => handleProductBlur(index, 'code', e.target.value)}
/>

              </div>
              <div className="col-md-4">
              <input
  type="text"
  className="form-control"
  placeholder="Product Name"
  value={product.name}
  onChange={(e) => handleProductChange(index, 'name', e.target.value)}
  onBlur={(e) => handleProductBlur(index, 'name', e.target.value)}
/>

                {suggestions.length > 0 && (
                  <ul className="list-group">
                    {suggestions.map((suggestion, i) => (
                      <li key={i} className="list-group-item">
                        {suggestion.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="col-md-2">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Price"
                  value={product.price}
                  readOnly
                />
              </div>
              <div className="col-md-2">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Quantity"
                  value={product.quantity}
                  onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Discount"
                  value={product.discount}
                  onChange={(e) => handleProductChange(index, 'discount', e.target.value)}
                />
                <select
                  className="form-select"
                  value={product.discountType}
                  onChange={(e) => handleProductChange(index, 'discountType', e.target.value)}
                >
                  <option value="percentage">%</option>
                  <option value="amount">Amount</option>
                </select>
              </div>
            </div>
          ))}
          <button className="btn btn-primary" onClick={handleAddProduct}>Add Product</button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <button className="btn btn-success" onClick={handleBillGeneration}>Generate Bill</button>
        </div>
      </div>

      {bill.products.length > 0 && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Bill Preview</h5>
            <p>Bill No: {billNo}</p>
            <p>Date: {date}</p>
            <p>Customer Name: {customer.name}</p>
            <p>Customer Mobile: {customer.mobile}</p>

            <table className="table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Discount</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {bill.products.map((product, index) => (
                  <tr key={index}>
                    <td>{product.name}</td>
                    <td>{product.price}</td>
                    <td>{product.quantity}</td>
                    <td>{product.discount > 0 ? product.discount : '-'}</td>
                    <td>{product.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p>Total Discount: {bill.totalDiscount}</p>
            <p>Total Price: {bill.totalPrice}</p>

            <button className="btn btn-primary" onClick={handleSaveBill}>Save Bill</button>
            <button className="btn btn-secondary ms-2">Edit</button>
            <button className="btn btn-success ms-2">Print</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
