import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/OrderHistory.css";

const OrderHistory = () => {
  const location = useLocation();
const navigate = useNavigate();
const { companyName } = location.state || {};
const [companyOrders, setCompanyOrders] = useState([]);

useEffect(() => {
  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orders");
      const data = await res.json();

      const filtered = data.filter(order =>
        order.company_name?.toLowerCase().trim() === companyName?.toLowerCase().trim()
      );      
      setCompanyOrders(filtered);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  if (companyName) fetchOrders();
}, [companyName]);

if (!companyName) {
  return (
    <div className="container mt-4">
      <h3>No company selected</h3>
    </div>
  );
}

  return (
    <div className="container mt-5">
      <h3 style={{ color: "white", fontFamily: "Tinos, serif" }}>Invoice History for:- <span style={{ color: "gold", fontFamily: "Audiowide, sans-serif" }}>{companyName}</span> </h3>

      <div className="card mt-4 p-4 shadow" style={{ overflowX: "auto", whiteSpace: "nowrap",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.18)",
          color: "#fff",
          transition: "transform 0.3s ease, box-shadow 0.3s ease" }}
      >
        <h4 className="mb-3">Invoice Details</h4>
        <div className="scroll-container glow-table" style={{ overflowX: "auto", whiteSpace: "nowrap", scrollbarColor: "white transparent" }}>
          <table className="table table-bordered table-striped" style={{ border: "1px solid grey" }}>
            <thead className="table-dark">
              <tr>
                <th className="text-center">Invoice No.</th>
                <th className="text-center">Invoice Date</th>
                <th className="text-center">Invoice Month</th>
                <th className="text-center">Product Name</th>
                <th className="text-center">Quantity</th>
                <th className="text-center">Unit</th>
                <th className="text-center">Price</th>
                <th className="text-center">GST</th>
                <th className="text-center">CGST</th>
                <th className="text-center">SGST</th>
                <th className="text-center">IGST</th>
                <th className="text-center">Transport</th>
                <th className="text-center">Final Amount</th>
                <th className="text-center">Job Work/Supplier</th>
                <th className="text-center">Payment Status</th>
                <th className="text-center">Amount Paid</th>
                <th className="text-center">Pending Amount</th>
                <th className="text-center">Payment Type</th>
                <th className="text-center">Payment Details</th>
              </tr>
            </thead>
            <tbody>
              {companyOrders.length > 0 ? (
                companyOrders.map((orderItem, index) => (
                  <tr key={index} style={orderItem.cancelled ? { opacity: 0.5, textDecoration: "line-through", textDecorationColor: "#FF073A" } : {}}
                  title={orderItem.cancelled ? "This invoice was cancelled" : ""}>
                    <td className="table-dark text-center">{orderItem.invoice_no}</td>
                    <td className="table-dark text-center">{orderItem.invoice_date}</td>
                    <td className="table-dark text-center">{orderItem.invoice_month}</td>
                    
                    <td className="table-dark text-center">
                      {orderItem.products.map((product, i) => (
                        <div key={i} title={product.productDetails}>
                          {product.productDetails}
                          {i !== orderItem.products.length - 1 && <hr />}
                        </div>
                      ))}
                    </td>

                    <td className="table-dark">
                      {orderItem.products.map((product, i) => (
                        <div key={i} className="text-center">
                          {product.quantity}
                          {i !== orderItem.products.length - 1 && <hr />}
                        </div>
                      ))}
                    </td>

                    <td className="table-dark">
                      {orderItem.products.map((product, i) => (
                        <div key={i} className="text-center">
                          {product.unit}
                          {i !== orderItem.products.length - 1 && <hr />}
                        </div>
                      ))}
                    </td>

                    <td className="table-dark">
                      {orderItem.products.map((product, i) => (
                        <div key={i} className="text-center">
                          ₹{product.price}
                          {i !== orderItem.products.length - 1 && <hr />}
                        </div>
                      ))}
                    </td>

                    <td className="table-dark text-center">{orderItem.gst}</td>
                    <td className="table-dark text-center">₹{orderItem.cgst}</td>
                    <td className="table-dark text-center">₹{orderItem.sgst}</td>
                    <td className="table-dark text-center">₹{orderItem.igst}</td>
                    <td className="table-dark text-center">{orderItem.transport === "Yes" ? `₹${orderItem.transport_price}` : "-"}</td>
                    <td className="table-dark text-center">₹{orderItem.sales_amount}</td>
                    <td className="table-dark text-center">{orderItem.job_work_supplier || "-"}</td>
                    <td className="table-dark text-center">
                      <span className={`badge ${orderItem.cancelled ? "bg-secondary" : orderItem.payment_status === "Paid"
                        ? "bg-success"
                        : orderItem.payment_status === "Partial"
                        ? "bg-warning"
                        : "bg-danger"}`}>
                        {orderItem.cancelled ? "Cancelled" : orderItem.payment_status}
                      </span>
                    </td>

                    <td className="table-dark text-center">
                      {orderItem.cancelled ? (
                        "-"
                      ) : orderItem.payment_status === "Partial" ? (
                        <span className="text-warning fw-bold">₹{orderItem.amount_paid}</span>
                      ) : orderItem.payment_status === "Paid" ? (
                        <span className="fw-bold" style={{ color: "lightgreen" }}>₹{orderItem.sales_amount}</span>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="table-dark text-center">
                      {orderItem.payment_status === "Partial" ? (
                        <span className="text-danger fw-bold">₹{orderItem.sales_amount - orderItem.amount_paid}</span>
                      ) : orderItem.payment_status === "Pending" ? (
                        <span className="text-danger fw-bold">₹{orderItem.sales_amount}</span>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="table-dark text-center">{orderItem.payment_type || "-"}</td>
                    <td className="table-dark text-center">
                      {orderItem.payment_type === "Check" ? (
                        <>
                          <div><strong>Bank:</strong> {orderItem.bank_name}</div>
                          <div><strong>Cheque No:</strong> {orderItem.check_no}</div>
                        </>
                      ) : orderItem.payment_type === "Online" ? (
                        <div><strong>Txn ID:</strong> {orderItem.transaction_id}</div>
                      ) : orderItem.payment_type === "Cash" ? (
                        "-"
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="19" className="text-center bg-dark text-light">No products found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Back Button */}
      <div className="text-center mt-4 mb-4">
        <button className="btn btn-secondary" onClick={() => navigate("/company")}>Back to Companies</button>
      </div>
    </div>
  );
};

export default OrderHistory;
