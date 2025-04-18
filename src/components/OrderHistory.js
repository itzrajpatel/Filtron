import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/OrderHistory.css";

const OrderHistory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { companyName } = location.state || {};

  if (!companyName) {
    return <div className="container mt-4"><h3>No company selected</h3></div>;
  }

  const allOrders = JSON.parse(localStorage.getItem("orders")) || [];
  const companyOrders = allOrders.filter(order => order.companyName === companyName);

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
                    <td className="table-dark text-center">{orderItem.invoiceNo}</td>
                    <td className="table-dark text-center">{orderItem.invoiceDate}</td>
                    <td className="table-dark text-center">{orderItem.invoiceMonth}</td>
                    
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
                    <td className="table-dark text-center">{orderItem.transport === "Yes" ? `₹${orderItem.transportPrice}` : "N/A"}</td>
                    <td className="table-dark text-center">₹{orderItem.salesAmount}</td>
                    <td className="table-dark text-center">{orderItem.jobWorkSupplier || "N/A"}</td>
                    <td className="table-dark text-center">
                      <span className={`badge ${orderItem.cancelled ? "bg-secondary" : orderItem.paymentStatus === "Paid"
                        ? "bg-success"
                        : orderItem.paymentStatus === "Partial"
                        ? "bg-warning"
                        : "bg-danger"}`}>
                        {orderItem.cancelled ? "Cancelled" : orderItem.paymentStatus}
                      </span>
                    </td>

                    <td className="table-dark text-center">
                      {orderItem.cancelled ? (
                        "-"
                      ) : orderItem.paymentStatus === "Partial" ? (
                        <span className="text-warning fw-bold">₹{orderItem.amountPaid}</span>
                      ) : orderItem.paymentStatus === "Paid" ? (
                        <span className="fw-bold" style={{ color: "lightgreen" }}>₹{orderItem.salesAmount}</span>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="table-dark text-center">
                      {orderItem.paymentStatus === "Partial" ? (
                        <span className="text-danger fw-bold">₹{orderItem.salesAmount - orderItem.amountPaid}</span>
                      ) : orderItem.paymentStatus === "Pending" ? (
                        <span className="text-danger fw-bold">₹{orderItem.salesAmount}</span>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="table-dark text-center">{orderItem.paymentType || "-"}</td>
                    <td className="table-dark text-center">
                      {orderItem.paymentType === "Check" ? (
                        <>
                          <div><strong>Bank:</strong> {orderItem.bankName}</div>
                          <div><strong>Check No:</strong> {orderItem.checkNo}</div>
                        </>
                      ) : orderItem.paymentType === "Online" ? (
                        <div><strong>Txn ID:</strong> {orderItem.transactionId}</div>
                      ) : orderItem.paymentType === "Cash" ? (
                        "-"
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="14" className="text-center">No products found</td>
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
