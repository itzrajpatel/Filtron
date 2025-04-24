import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Purchase.css";

// TESTING
import { Modal, Button, Form } from "react-bootstrap";

const Purchase = () => {
  const [purchases, setPurchases] = useState([]);
  const navigate = useNavigate();

  // TESTING
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // TESTING
  const handleEditClick = (purchase, index) => {
    setSelectedPurchase({ ...purchase, srNo: index }); // Save index inside selected purchase
    setShowModal(true);
  };  

  // TESTING
  const handleSave = () => {
    const updatedPurchases = purchases.map((p, idx) =>
      idx === selectedPurchase.srNo ? selectedPurchase : p
    );
  
    setPurchases(updatedPurchases);
    localStorage.setItem("purchase", JSON.stringify(updatedPurchases));
    setShowModal(false);
  };  

  // TESTING
  const calculateTotals = (purchase) => {
    const finalTotal = purchase.products.reduce((sum, p) => {
      const qty = parseFloat(p.quantity) || 0;
      const price = parseFloat(p.price) || 0;
      return sum + qty * price;
    }, 0);
  
    const transportCharge = parseFloat(purchase.transportCharge) || 0;
    const discount = parseFloat(purchase.discount) || 0;
    const tcs = parseFloat(purchase.tcs) || 0;
    const freight = parseFloat(purchase.freight) || 0;
  
    const grandTotal = finalTotal + transportCharge - discount;
  
    const gstRate = purchase.gst ? parseFloat(purchase.gst.replace("%", "")) / 100 : 0;
    const isGujarat = purchase.stateCode === "24";
  
    const cgst = isGujarat ? (grandTotal * gstRate) / 2 : 0;
    const sgst = isGujarat ? (grandTotal * gstRate) / 2 : 0;
    const igst = !isGujarat ? grandTotal * gstRate : 0;
  
    const gstTotal = cgst + sgst + igst;
  
    const salesAmount = grandTotal + gstTotal + tcs;
    const grossAmount = salesAmount + freight;
  
    return {
      finalTotal: finalTotal.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      igst: igst.toFixed(2),
      salesAmount: salesAmount.toFixed(2),
      grossAmount: grossAmount.toFixed(2),
    };
  };  

  // TESTING
  const handleChange = (e, index, field) => {
    const updated = { ...selectedPurchase };
  
    if (index === null) {
      updated[field] = e.target.value;
  
      if (field === "paymentStatus") {
        updated.amountPaid = updated.paymentStatus === "Partial" ? updated.amountPaid : "";
        updated.paymentType = "";
        updated.bankName = "";
        updated.checkNo = "";
        updated.transactionId = "";
      }
    } else {
      updated.products[index][field] = e.target.value;
    }
  
    // ➔ Recalculate totals on important fields
    if (
      (index !== null && (field === "quantity" || field === "price")) ||
      (index === null && (field === "transportCharge" || field === "discount" || field === "tcs" || field === "freight"))
    ) {
      const totals = calculateTotals(updated);
      setSelectedPurchase({ ...updated, ...totals });
    } else {
      setSelectedPurchase(updated);
    }
  };    

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
              
              {/* TESTING */}
              <th className="text-center">Edit</th>
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

                  {/* <td className="table-dark text-center">{purchase.paymentType}</td> */}
                  <td className="table-dark text-center">
                    {purchase.paymentStatus === "Partial" ? (
                      <span>{purchase.paymentType}</span>
                    ) : purchase.paymentStatus === "Paid" ? (
                      <span>{purchase.paymentType}</span>
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* <td className="table-dark text-center">
                    {purchase.bankName && <div>Bank: {purchase.bankName}</div>}
                    {purchase.checkNo && <div>Cheque No: {purchase.checkNo}</div>}
                    {purchase.transactionId && <div>Txn: {purchase.transactionId}</div>}
                  </td> */}
                  <td className="table-dark text-center">
                    {purchase.paymentType === "Check" ? (
                      <span>
                        {purchase.bankName && <div>Bank: {purchase.bankName}</div>}
                        {purchase.checkNo && <div>Cheque No: {purchase.checkNo}</div>}
                        {purchase.transactionId && <div>Txn: {purchase.transactionId}</div>}
                      </span>
                    ) : purchase.paymentType === "Online" ? (
                      <span>
                        {purchase.bankName && <div>Bank: {purchase.bankName}</div>}
                        {purchase.checkNo && <div>Cheque No: {purchase.checkNo}</div>}
                        {purchase.transactionId && <div>Txn: {purchase.transactionId}</div>}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* <td className="table-dark text-center">{purchase.dateOfPayment}</td> */}
                  <td className="table-dark text-center">
                    {purchase.paymentStatus === "Partial" ? (
                      <span>{purchase.dateOfPayment}</span>
                    ) : purchase.paymentStatus === "Paid" ? (
                      <span>{purchase.dateOfPayment}</span>
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* TESTING */}
                  <td className="table-dark text-center">
                  <button className="btn btn-info" onClick={() => handleEditClick(purchase, index)}>
                    Edit
                  </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="35" className="text-center text-light bg-transparent">No Purchase Added Yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* TESTING */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-dark text-light custom-close">
          <Modal.Title>Edit Purchase</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          {selectedPurchase && (
            <Form>
              <Form.Group className="mt-3">
                <Form.Label>Type of Purchase</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedPurchase.typeOfPurchase}
                  onChange={(e) => handleChange(e, null, "typeOfPurchase")}
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Invoice No</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedPurchase.invoiceNo}
                  onChange={(e) => handleChange(e, null, "invoiceNo")}
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Invoice Date</Form.Label>
                <Form.Control
                  type="date"
                  value={selectedPurchase.invoiceDate}
                  onChange={(e) => handleChange(e, null, "invoiceDate")}
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Invoice Month</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedPurchase.invoiceMonth}
                  onChange={(e) => handleChange(e, null, "invoiceMonth")}
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Company Name</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedPurchase.companyName}
                  onChange={(e) => handleChange(e, null, "companyName")}
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Product Name</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedPurchase.productName}
                  onChange={(e) => handleChange(e, null, "productName")}
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Product Code</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedPurchase.productCode}
                  onChange={(e) => handleChange(e, null, "productCode")}
                />
              </Form.Group>

              {selectedPurchase.products.map((product, index) => (
                <div className="mt-3 border rounded p-2 position-relative" key={index}>
                  <Form.Group>
                    <Form.Label>Product Description</Form.Label>
                    <Form.Control
                      type="text"
                      value={product.productDescription}
                      onChange={(e) => handleChange(e, index, "productDescription")}
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      value={product.quantity}
                      onChange={(e) => handleChange(e, index, "quantity")}
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>Price</Form.Label>
                    <Form.Control
                      type="number"
                      value={product.price}
                      onChange={(e) => handleChange(e, index, "price")}
                    />
                  </Form.Group>

                  {/* ➖ Remove Button */}
                  {selectedPurchase.products.length > 1 && (
                    <Button
                      variant="danger"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        const updated = { ...selectedPurchase };
                        updated.products.splice(index, 1);
                        setSelectedPurchase(updated);
                      }}
                    >
                      ➖ Remove Product
                    </Button>
                  )}

                  <hr />
                </div>
              ))}

              {/* ➕ Add Product Button */}
              <div className="text-center mt-3">
                <Button
                  variant="success"
                  onClick={() => {
                    const updated = { ...selectedPurchase };
                    updated.products.push({
                      productDescription: "",
                      quantity: "",
                      price: "",
                      hsnNo: "",
                      unit: "",
                    });
                    setSelectedPurchase(updated);
                  }}
                >
                  ➕ Add Product
                </Button>
              </div>

              {/* Remaining Form Fields */}
              <Form.Group className="mt-4">
                <Form.Label>Transport Charge</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedPurchase.transportCharge}
                  onChange={(e) => handleChange(e, null, "transportCharge")}
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Discount</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedPurchase.discount}
                  onChange={(e) => handleChange(e, null, "discount")}
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>TCS</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedPurchase.tcs}
                  onChange={(e) => handleChange(e, null, "tcs")}
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Freight</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedPurchase.freight}
                  onChange={(e) => handleChange(e, null, "freight")}
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Transport</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedPurchase.transport}
                  onChange={(e) => handleChange(e, null, "transport")}
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Transporter</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedPurchase.transporter}
                  onChange={(e) => handleChange(e, null, "transporter")}
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>LR No.</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedPurchase.lrNo}
                  onChange={(e) => handleChange(e, null, "lrNo")}
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Payment Status</Form.Label>
                <Form.Select
                  value={selectedPurchase.paymentStatus}
                  onChange={(e) => handleChange(e, null, "paymentStatus")}
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                </Form.Select>
              </Form.Group>

              {selectedPurchase.paymentStatus === "Partial" && (
                <Form.Group className="mt-3">
                  <Form.Label>Amount Paid</Form.Label>
                  <Form.Control
                    type="number"
                    value={selectedPurchase.amountPaid}
                    onChange={(e) => handleChange(e, null, "amountPaid")}
                  />
                </Form.Group>
              )}

              {["Paid", "Partial"].includes(selectedPurchase.paymentStatus) && (
                <>
                  <Form.Group className="mt-3">
                    <Form.Label>Payment Type</Form.Label>
                    <Form.Select
                      value={selectedPurchase.paymentType || ""}
                      onChange={(e) => handleChange(e, null, "paymentType")}
                    >
                      <option value="">Select Payment Type</option>
                      <option value="Cash">Cash</option>
                      <option value="Check">Cheque</option>
                      <option value="Online">Online</option>
                    </Form.Select>
                  </Form.Group>

                  {selectedPurchase.paymentType === "Check" && (
                    <>
                      <Form.Group className="mt-3">
                        <Form.Label>Bank Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={selectedPurchase.bankName || ""}
                          onChange={(e) => handleChange(e, null, "bankName")}
                        />
                      </Form.Group>
                      <Form.Group className="mt-3">
                        <Form.Label>Cheque No.</Form.Label>
                        <Form.Control
                          type="text"
                          value={selectedPurchase.checkNo || ""}
                          onChange={(e) => handleChange(e, null, "checkNo")}
                        />
                      </Form.Group>
                    </>
                  )}

                  {selectedPurchase.paymentType === "Online" && (
                    <Form.Group className="mt-3">
                      <Form.Label>Transaction ID</Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedPurchase.transactionId || ""}
                        onChange={(e) => handleChange(e, null, "transactionId")}
                      />
                    </Form.Group>
                  )}

                  <Form.Group className="mt-3">
                    <Form.Label>Date of Payment</Form.Label>
                    <Form.Control
                      type="date"
                      value={selectedPurchase.dateOfPayment}
                      onChange={(e) => handleChange(e, null, "dateOfPayment")}
                    />
                  </Form.Group>
                </>
              )}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-dark text-light">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save Changes</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Purchase;
