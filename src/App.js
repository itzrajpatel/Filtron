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
import First from "./components/FirstPage";
import Purchase from "./components/Purchase";
import AddPurchase from "./components/AddPurchase";
import Growth from "./components/Growth";
import PurchasePayment from "./components/PurchasePayment";
import Login from "./components/Login";
import PrivateRoute from "./components/PrivateRoute";
import Payment from "./components/Payment";

// This is a new component where we can safely use useLocation
const AppRoutes = () => {
  const location = useLocation();
  const hideNavbar = ["/", "/home"].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<PrivateRoute> <First /> </PrivateRoute>} />
        <Route path="/company" element={<PrivateRoute> <Home /> </PrivateRoute>} />
        <Route path="/add-company" element={<PrivateRoute> <AddCompany /> </PrivateRoute>} />
        <Route path="/invoice" element={<PrivateRoute> <Orders /> </PrivateRoute>} />
        <Route path="/purchase" element={<PrivateRoute> <Purchase /> </PrivateRoute>} />
        <Route path="/purchase/add-purchase" element={<PrivateRoute> <AddPurchase /> </PrivateRoute>} />
        <Route path="/invoice/add-invoice" element={<PrivateRoute> <AddOrder /> </PrivateRoute>} />
        <Route path="/invoice/view-invoice" element={<PrivateRoute> <ViewOrder /> </PrivateRoute>} />
        <Route path="/invoice-history" element={<PrivateRoute> <OrderHistory /> </PrivateRoute>} />
        <Route path="/create-bill" element={<PrivateRoute> <CreateBill /> </PrivateRoute>} />
        <Route path="/create-chalan" element={<PrivateRoute> <Chalan /> </PrivateRoute>} />
        <Route path="/growth" element={<PrivateRoute> <Growth /> </PrivateRoute>} />
        <Route path="/purchase-payment" element={<PrivateRoute> <PurchasePayment /> </PrivateRoute>} />
        <Route path="/payment" element={<PrivateRoute> <Payment /> </PrivateRoute>} />
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
