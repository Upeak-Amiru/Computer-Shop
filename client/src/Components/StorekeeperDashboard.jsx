import React from 'react';  
import { Link, Outlet } from 'react-router-dom'; 
import "bootstrap-icons/font/bootstrap-icons.css";


const StorekeeperDashboard = () => {
  return (
    <div className="container-fluid" > 
      <div className="row flex-nowrap">  
      <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 custom-bg  ">   
          <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-3 text-white min-vh-100 bg-dark"> 
        <Link 
        to="/" 
        className="d-flex align-items-center pb-3 mb-md-1 mt-md-3 me-md-auto text-white text-decoration-none" 
        >
          <span className="fs-5 fw-bolder d-none d-sm-inline">
            Back
            </span> 
           </Link> 
        <ul 
        className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start" 
        id="menu" 
        > 
          <li className="w-100"> 
            <Link 
            to="/StorekeeperDashboard" 
            className="d-flex nav-link text-white px-0 align-middle" 
            > 
            <i className="fs-4 bi-speedometer ms-2"></i> 
            <span className="ms-2 d-none d-sm-inline">Dashboard</span> 
            </Link> 
          </li> 
          <li className="w-100"> 
            <Link 
            to="/StorekeeperDashboard/products" 
            className="d-flex nav-link text-white px-0 align-middle" 
            > 
            <i className="fs-4 bi-people ms-2"></i> 
            <span className="ms-2 d-none d-sm-inline">Products</span> 
            </Link> 
          </li> 
          <li className="w-100"> 
            <Link 
            to="/StorekeeperDashboard/order" 
            className="d-flex nav-link text-white px-0 align-middle" 
            > 
            <i className="fs-4 bi-columns ms-2"></i> 
            <span className="ms-2 d-none d-sm-inline">Order</span> 
            </Link> 
          </li>  
          <li className="w-100"> 
            <Link 
            to="/StorekeeperDashboard/suppliers" 
            className="d-flex nav-link text-white px-0 align-middle" 
            > 
            <i className="fs-4 bi-columns ms-2"></i> 
            <span className="ms-2 d-none d-sm-inline">Suppliers</span> 
            </Link> 
          </li>  
          <li className="w-100"> 
            <Link 
            to="/StorekeeperDashboard/reports" 
            className="d-flex nav-link text-white px-0 align-middle" 
            > 
            <i className="fs-4 bi-columns ms-2"></i> 
            <span className="ms-2 d-none d-sm-inline">Reports</span> 
            </Link> 
          </li> 
          
          <li className="w-100"> 
            <Link 
            className="d-flex nav-link text-white px-0 align-middle" 
            > 
            <i className="fs-4 bi-power ms-2"></i> 
            <span className="ms-2 d-none d-sm-inline">Logout</span> 
            </Link> 
          </li> 
        </ul>
          </div>
        </div> 
        <div className="col p-0 m-0"> 
          <div className="p-2 d-flex justify-content-end shadow"> 
            <h4 className="dashboard_heading">Hzone</h4>
          </div> 
          <Outlet /> 
        </div>
      </div>
    </div>
  )
}

export default StorekeeperDashboard;