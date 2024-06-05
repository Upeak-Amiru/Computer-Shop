import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const OtherRoles = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/manager/verifyManager', { username, password });
      if (response.data.success) {
        navigate(`/${selectedRole}Dashboard`);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('Server error. Please try again later.');
    }
  };

  const renderLoginForm = () => (
    <div className="card mt-4">
      <div className="card-body">
        <h5 className="card-title">Login as Manager for {selectedRole}</h5>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
      </div>
    </div>
  );

  return (
    <div>
    <br/>
    <div className="container mt-4">
  <h2 className="text-center mb-4">Login as Manager to Access Role Dashboards</h2>
<br/><br/><br/>
  <div className="row justify-content-center">
    <div className="col-md-4">
      {['Cashier', 'StoreKeeper', 'Technician'].map((role) => (
        <button
          key={role}
          className="btn btn-primary mb-4 w-100"
          onClick={() => setSelectedRole(role)}
        >
          {role}
        </button>
      ))}
    </div>
  </div>

  {selectedRole && renderLoginForm()}
</div>
</div>

  );
};

export default OtherRoles;
