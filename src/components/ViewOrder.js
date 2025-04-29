import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ViewOrder = () => {
  const location = useLocation();
const navigate = useNavigate();
const companyName = location.state?.companyName;

const [orders, setOrders] = useState([]);
const [companyDetails, setCompanyDetails] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      // Fetch all orders of the company
      const res = await fetch(`http://localhost:5000/api/orders/company/${encodeURIComponent(companyName)}`);
      const orderData = await res.json();
      setOrders(orderData);

      // Fetch company details
      const companyRes = await fetch("http://localhost:5000/api/companies");
      const companies = await companyRes.json();
      const match = companies.find(c => c.company_name === companyName);
      setCompanyDetails({
        companyName: match.company_name,
        customerName: match.customer_name,
        address: match.address,
        state: match.state,
        stateCode: match.state_code,
        contact: match.contact,
        email: match.email,
        gstNo: match.gst_no,
      });
    } catch (err) {
      console.error("Error loading company details:", err);
    }
  };

  if (companyName) {
    fetchData();
  }
}, [companyName]);

  if (!companyName) {
    return <h2 className="text-center mt-5">No Order Data Found</h2>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center" style={{ color: "white", fontFamily: "Tinos, serif", animation: "fadeSlideUp 1.5s ease-out" }}>Invoice Details</h2>

      {/* Company Details (Fetched from Home.js Data) */}
      {companyDetails && (
        <div className="card mt-4 p-4 shadow" style={{
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.18)",
          color: "#fff",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
        }}>        
          <h2 className="mb-3" style={{ color: "gold", fontFamily: "DM Serif Text, serif" }}>Company Details:-</h2>
          <p style={{ color: "white" }}><strong style={{ fontFamily: "Tinos, serif", color: "#a4d8fc" }}>Company Name:</strong> {companyDetails.companyName}</p>
          <p style={{ color: "white" }}><strong style={{ fontFamily: "Orbitron, sans-serif", color: "#a4d8fc" }}>Address:</strong> {companyDetails.address}</p>
          <p style={{ color: "white" }}><strong style={{ fontFamily: "Orbitron, sans-serif", color: "#a4d8fc" }}>State:</strong> {companyDetails.state} ({companyDetails.stateCode})</p>
          <p style={{ color: "white" }}><strong style={{ fontFamily: "Orbitron, sans-serif", color: "#a4d8fc" }}>Contact:</strong> {companyDetails.contact}</p>
          <p style={{ color: "white" }}><strong style={{ fontFamily: "Orbitron, sans-serif", color: "#a4d8fc" }}>Email:</strong> {companyDetails.email}</p>
          <p style={{ color: "white" }}><strong style={{ fontFamily: "Orbitron, sans-serif", color: "#a4d8fc" }}>GST No:</strong> {companyDetails.gstNo || "N/A"}</p>
        </div>
      )}

      {/* Product Details Table (Filtered for the selected company) */}
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
        <h2 className="mb-3" style={{ color: "gold", fontFamily: "DM Serif Text, serif" }}>Product Details</h2>
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
  {orders.length > 0 ? (
    orders.map((orderItem, index) => (
      <tr
        key={index}
        style={
          orderItem.cancelled
            ? {
                opacity: 0.5,
                textDecoration: "line-through",
                textDecorationColor: "#FF073A",
              }
            : {}
        }
        title={orderItem.cancelled ? "This invoice has been cancelled" : ""}
      >
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

        <td className="table-dark text-center">
          {orderItem.products.map((product, i) => (
            <div key={i}>{product.quantity}{i !== orderItem.products.length - 1 && <hr />}</div>
          ))}
        </td>

        <td className="table-dark text-center">
          {orderItem.products.map((product, i) => (
            <div key={i}>{product.unit}{i !== orderItem.products.length - 1 && <hr />}</div>
          ))}
        </td>

        <td className="table-dark text-center">
          {orderItem.products.map((product, i) => (
            <div key={i}>₹{product.price}{i !== orderItem.products.length - 1 && <hr />}</div>
          ))}
        </td>

        <td className="table-dark text-center">{orderItem.gst}</td>
        <td className="table-dark text-center">₹{orderItem.cgst}</td>
        <td className="table-dark text-center">₹{orderItem.sgst}</td>
        <td className="table-dark text-center">₹{orderItem.igst}</td>
        <td className="table-dark text-center">
          {orderItem.transport === "Yes" ? `₹${orderItem.transport_price}` : "N/A"}
        </td>
        <td className="table-dark text-center">₹{orderItem.sales_amount}</td>
        <td className="table-dark text-center">
          {orderItem.job_work_supplier !== "" ? orderItem.job_work_supplier : "N/A"}
        </td>
        <td className="table-dark text-center">
          <span
            className={`badge ${
              orderItem.cancelled
                ? "bg-secondary"
                : orderItem.payment_status === "Paid"
                ? "bg-success"
                : orderItem.payment_status === "Partial"
                ? "bg-warning"
                : "bg-danger"
            }`}
          >
            {orderItem.cancelled ? "Cancelled" : orderItem.payment_status}
          </span>
        </td>

        <td className="table-dark text-center">
          {orderItem.cancelled ? (
            "-"
          ) : orderItem.payment_status === "Partial" ? (
            <span className="text-warning fw-bold">₹{orderItem.amount_paid}</span>
          ) : orderItem.payment_status === "Paid" ? (
            <span className="fw-bold" style={{ color: "lightgreen" }}>
              ₹{orderItem.sales_amount}
            </span>
          ) : (
            "-"
          )}
        </td>

        <td className="table-dark text-center">
          {orderItem.payment_status === "Partial" ? (
            <span className="text-danger fw-bold">
              ₹{orderItem.sales_amount - orderItem.amount_paid}
            </span>
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
              <div>
                <strong>Bank:</strong> {orderItem.bank_name}
              </div>
              <div>
                <strong>Check No:</strong> {orderItem.check_no}
              </div>
            </>
          ) : orderItem.payment_type === "Online" ? (
            <div>
              <strong>Txn ID:</strong> {orderItem.transaction_id}
            </div>
          ) : (
            "-"
          )}
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="18" className="text-center bg-dark text-light">
        No products found
      </td>
    </tr>
  )}
</tbody>
          </table>
        </div>
      </div>


      {/* Back Button */}
      <div className="text-center mt-4 mb-4">
        <button className="btn btn-secondary" onClick={() => navigate("/invoice")}>Back to Invoices</button>
      </div>
    </div>
  );
};

export default ViewOrder;
