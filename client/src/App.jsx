import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter , Routes, Route } from 'react-router-dom';
import Login from './Components/Login';
import ManagerDashboard from './Components/ManagerDashboard';
import CashierDashboard from './Components/CashierDashboard';
import StoreKeeperDashboard from './Components/StorekeeperDashboard';
import TechnicianDashboard from './Components/TechnicianDashboard';
import Order from './Components/Order';
import Inventory from './Components/Inventory';
import Reports from './Components/Reports';
import OtherRoles from './Components/OtherRoles';
import ManageAccounts from './Components/ManageAccounts';
import OrderProperties from './Components/Orderproperties';
import Transactions from './Components/Transactions';
import Repairs from './Components/Repairs';
import DayEnd from './Components/DayEnd';
import Products from './Components/Products';
import CashierOrder from './Components/CashierOrder';
import CashierReports from './Components/CashierReports';
import Suppliers from './Components/Suppliers';





const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/managerdashboard" element={<ManagerDashboard />} >
          <Route path="/managerdashboard/inventory" element={<Inventory />} />
          <Route path="/managerdashboard/order" element={<Order/>} />
          <Route path="/managerdashboard/reports" element={<Reports />} />
          <Route path="/managerdashboard/order/orderproperties" element={<OrderProperties />} />
          <Route path="/managerdashboard/otherroles" element={<OtherRoles />}/>
          <Route path="/managerdashboard/manageaccounts" element={<ManageAccounts />} />
        </Route>
        
        <Route path="/CashierDashboard" element={<CashierDashboard />} >
          <Route path="/CashierDashboard/transactions" element={<Transactions />} />
          <Route path="/CashierDashboard/repairs" element={<Repairs />} />
          <Route path="/CashierDashboard/dayend" element={<DayEnd />} />
        </Route>

        <Route path="/StorekeeperDashboard" element={<StoreKeeperDashboard />} >
          <Route path="/StorekeeperDashboard/products" element={<Products />} />
          <Route path="/StorekeeperDashboard/order" element={<CashierOrder/>} />
          <Route path="/StorekeeperDashboard/reports" element={<CashierReports />} />
          <Route path="/StorekeeperDashboard/suppliers" element={<Suppliers />} />
        </Route>

        <Route path="/TechnicianDashboard" element={<TechnicianDashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
