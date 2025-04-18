import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Orders from "./components/Orders";
import AddOrder from "./components/AddOrder";
import ViewOrder from "./components/ViewOrder";
import AddCompany from "./components/AddCompany";
import OrderHistory from "./components/OrderHistory";
import CreateBill from "./components/CreateBill";
import Chalan from "./components/Chalan";

//TESTING
import First from "./components/FirstPage";

// This is a new component where we can safely use useLocation
const AppRoutes = () => {
  const location = useLocation();
  const hideNavbar = location.pathname === "/";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<First />} />
        <Route path="/company" element={<Home />} />
        <Route path="/add-company" element={<AddCompany />} />
        <Route path="/invoice" element={<Orders />} />
        <Route path="/invoice/add-invoice" element={<AddOrder />} />
        <Route path="/invoice/view-invoice" element={<ViewOrder />} />
        <Route path="/invoice-history" element={<OrderHistory />} />
        <Route path="/create-bill" element={<CreateBill />} />
        <Route path="/create-chalan" element={<Chalan />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
