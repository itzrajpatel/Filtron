import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Purchase.css";

const Purchase = () => {
  const [purchases, setPurchases] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedPurchases = JSON.parse(localStorage.getItem("purchase")) || [];
    setPurchases(savedPurchases);
  }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mt-3" style={{ color: "white", fontFamily: "DM Serif Text, serif", animation: "fadeSlideUp 1.5s ease-out" }}>Purchase Details</h2>
        <button
          className="btn btn-primary glow-button glow-table"
          onClick={() => navigate("/purchase/add-purchase")}
          style={{ animation: "fadeSlideUp 1.5s ease-out", background: "transparent", color: "#fff", padding: "12px 24px", fontWeight: "600", fontSize: "16px", cursor: "pointer" }}
        >
          + Add Purchase
        </button>
      </div>

      <div className="scroll-container glow-table" style={{ animation: "fadeSlideUp 1.5s ease-out", borderRadius: "12px", overflowX: "auto", whiteSpace: "nowrap", scrollbarColor: "white transparent" }}>
        <table className="table table-bordered table-striped" style={{ border: "1px solid grey" }}>
          <thead className="table-dark">
            <tr>
              <th className="text-center">Sr No.</th>
              <th className="text-center">Date</th>
              <th className="text-center">Type of Purchase</th>
              <th className="text-center">Invoice No</th>
              <th className="text-center">Invoice Date</th>
              <th className="text-center">Invoice Month</th>
              <th className="text-center">Company Name</th>
              <th className="text-center">Item Name</th>
              <th className="text-center">Item Code</th>
              <th className="text-center">Item Details</th>
              <th className="text-center">HSN No.</th>
              <th className="text-center">Quantity</th>
              <th className="text-center">Unit</th>
              <th className="text-center">Price</th>
              <th className="text-center">Transport Charge</th>
              <th className="text-center">Discount</th>
              <th className="text-center">Grand Total</th>
              <th className="text-center">GST</th>
              <th className="text-center">CGST</th>
              <th className="text-center">SGST</th>
              <th className="text-center">IGST</th>
              <th className="text-center">TCS</th>
              <th className="text-center">Sales Amount</th>
              <th className="text-center">Freight</th>
              <th className="text-center">Gross Amount</th>
              <th className="text-center">Transport</th>
              <th className="text-center">Transporter</th>
              <th className="text-center">LR No.</th>
              <th className="text-center">Payment Status</th>
              <th className="text-center">Amount Paid</th>
              <th className="text-center">Pending Amount</th>
              <th className="text-center">Payment Type</th>
              <th className="text-center">Payment Details</th>
              <th className="text-center">Payment Date</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length > 0 ? (
              purchases.map((purchase, index) => (
                <tr key={index}>
                  <td className="table-dark text-center">{index + 1}</td>
                  <td className="table-dark text-center">{purchase.createdAt}</td>
                  <td className="table-dark text-center">{purchase.typeOfPurchase}</td>
                  <td className="table-dark text-center">{purchase.invoiceNo}</td>
                  <td className="table-dark text-center">{purchase.invoiceDate}</td>
                  <td className="table-dark text-center">{purchase.invoiceMonth}</td>
                  <td className="table-dark text-center">{purchase.companyName}</td>
                  <td className="table-dark text-center">{purchase.productName}</td>
                  <td className="table-dark text-center">{purchase.productCode}</td>

                  <td className="table-dark text-center">
                    {purchase.products.map((product, i) => (
                      <div
                        key={i}
                        style={{
                          whiteSpace: "nowrap",
                        }}
                        title={product.productDescription}
                      >
                        {product.productDescription}
                        {i !== purchase.products.length - 1 && <hr />}
                      </div>
                    ))}
                  </td>


                  <td className="table-dark text-center">
                    {purchase.products.map((product, i) => (
                      <div key={i}>{product.hsnNo}{i !== purchase.products.length - 1 && <hr />}</div>
                    ))}
                  </td>

                  <td className="table-dark text-center">
                    {purchase.products.map((product, i) => (
                      <div key={i}>{product.quantity}{i !== purchase.products.length - 1 && <hr />}</div>
                    ))}
                  </td>

                  <td className="table-dark text-center">
                    {purchase.products.map((product, i) => (
                      <div key={i}>{product.unit}{i !== purchase.products.length - 1 && <hr />}</div>
                    ))}
                  </td>

                  <td className="table-dark text-center">
                    {purchase.products.map((product, i) => (
                      <div key={i}>₹{product.price}{i !== purchase.products.length - 1 && <hr />}</div>
                    ))}
                  </td>

                  <td className="table-dark text-center">₹{purchase.transportCharge}</td>
                  <td className="table-dark text-center">₹{purchase.discount}</td>
                  <td className="table-dark text-center">₹{purchase.grandTotal}</td>
                  <td className="table-dark text-center">{purchase.gst}</td>
                  <td className="table-dark text-center">₹{purchase.cgst}</td>
                  <td className="table-dark text-center">₹{purchase.sgst}</td>
                  <td className="table-dark text-center">₹{purchase.igst}</td>
                  <td className="table-dark text-center">₹{purchase.tcs}</td>
                  <td className="table-dark text-center">₹{purchase.salesAmount}</td>
                  <td className="table-dark text-center">₹{purchase.freight}</td>
                  <td className="table-dark text-center">₹{purchase.grossAmount}</td>
                  <td className="table-dark text-center">{purchase.transport}</td>
                  <td className="table-dark text-center">{purchase.transporter}</td>
                  <td className="table-dark text-center">{purchase.lrNo}</td>
                  <td className="table-dark text-center">
                    <span className={`badge ${purchase.paymentStatus === "Paid" ? "bg-success" : purchase.paymentStatus === "Partial" ? "bg-warning" : "bg-danger"}`}>
                        {purchase.paymentStatus}
                      </span>
                  </td>
                  <td className="table-dark text-center">
                      {purchase.paymentStatus === "Partial" ? (
                        <span className="text-warning fw-bold">₹{purchase.amountPaid}</span>
                      ) : purchase.paymentStatus === "Paid" ? (
                        <span className="fw-bold" style={{ color: "lightgreen" }}>₹{purchase.salesAmount}</span>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="table-dark text-center">
                      {purchase.paymentStatus === "Partial" ? (
                        <span className="text-danger fw-bold">₹{purchase.salesAmount - purchase.amountPaid}</span>
                      ) : purchase.paymentStatus === "Pending" ? (
                        <span className="text-danger fw-bold">₹{purchase.salesAmount}</span>
                      ) : (
                        "-"
                      )}
                    </td>
                  <td className="table-dark text-center">{purchase.paymentType}</td>
                  <td className="table-dark text-center">
                    {purchase.bankName && <div>Bank: {purchase.bankName}</div>}
                    {purchase.checkNo && <div>Cheque: {purchase.checkNo}</div>}
                    {purchase.transactionId && <div>Txn: {purchase.transactionId}</div>}
                  </td>
                  <td className="table-dark text-center">{purchase.dateOfPayment}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="27" className="text-center text-light bg-transparent">No Purchase Added Yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Purchase;
