import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ViewOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order; // Get order details from navigation state

  const [companyDetails, setCompanyDetails] = useState(null);

  useEffect(() => {
    if (order?.companyName) {
      const savedCompanies = JSON.parse(localStorage.getItem("companies")) || [];
      const matchedCompany = savedCompanies.find(comp => comp.companyName === order.companyName);
      setCompanyDetails(matchedCompany || null);
    }
  }, [order]);

  if (!order) {
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
              </tr>
            </thead>
            <tbody>
              {(() => {
                const allOrders = JSON.parse(localStorage.getItem("orders")) || [];
                const companyOrders = allOrders.filter(o => o.companyName === order.companyName);

                return companyOrders.length > 0 ? (
                  companyOrders.map((orderItem, index) => {
                    return (
                      <tr key={index} style={orderItem.cancelled ? { opacity: 0.5, textDecoration: "line-through", textDecorationColor: "#FF073A" } : {}} title={orderItem.cancelled ? "This invoice has been cancelled" : ""}>
                        <td className="table-dark text-center">{orderItem.invoiceNo || "N/A"}</td>
                        <td className="table-dark text-center">{orderItem.invoiceDate || "N/A"}</td>
                        <td className="table-dark text-center">{orderItem.invoiceMonth || "N/A"}</td>
                        
                        <td className="table-dark text-center">
                          {orderItem.products.map((product, i) => (
                            <div 
                              key={i} 
                              title={product.productDetails} // Shows full text on hover
                            >
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
                        <td className="table-dark text-center">{orderItem.jobWorkSupplier !== "" ? `${orderItem.jobWorkSupplier}` : "N/A"}</td>
                        {/* <td>
                          <span className={`badge ${orderItem.paymentStatus === "Paid" ? "bg-success" : orderItem.paymentStatus === "Partial" ? "bg-warning" : "bg-danger"}`}>
                            {orderItem.paymentStatus}
                          </span>
                        </td>
                        <td>
                          {orderItem.paymentStatus === "Partial" ? (
                            <span className="text-warning fw-bold">₹{orderItem.amountPaid}</span>
                          ) : orderItem.paymentStatus === "Paid" ? (
                            <span className="text-success fw-bold">₹{orderItem.salesAmount}</span>
                          ) : (
                            "-"
                          )}
                        </td> */}
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
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="14" className="text-center">No products found</td>
                  </tr>
                );
              })()}
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
