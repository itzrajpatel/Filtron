import React, { useState, useEffect } from "react";
import "../styles/PurchasePayment.css";

// TESTING
import { Modal, Button, Form } from "react-bootstrap";

const Purchase = () => {
  const [purchases, setPurchases] = useState([]);

  // TESTING
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // TESTING
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");

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
        <h2 className="mt-3" style={{ color: "white", fontFamily: "DM Serif Text, serif", animation: "fadeSlideUp 1.5s ease-out" }}>Purchase Payment</h2>
      </div>

      {/* Filter Section */}
      <div className="d-flex gap-3 mb-4" style={{ animation: "fadeSlideUp 1.5s ease-out" }}>
        <div>
          <select
            className="form-select"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
          >
            <option value="">All Companies</option>
            {[...new Set(purchases.map(p => p.companyName))].map((name, idx) => (
              <option key={idx} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            className="form-select"
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Partial">Partial</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
      </div>
      
      {/* Table Section */}
      <div className="scroll-container glow-table" style={{ animation: "fadeSlideUp 1.5s ease-out", borderRadius: "12px", overflowX: "auto", whiteSpace: "nowrap", scrollbarColor: "white transparent" }}>
        <table className="table table-bordered table-striped" style={{ border: "1px solid grey" }}>
          <thead className="table-dark">
            <tr>
              <th className="text-center">Sr No.</th>
              <th className="text-center">Company Name</th>
              <th className="text-center">Invoice No</th>
              <th className="text-center">Sales Amount</th>
              <th className="text-center">Payment Status</th>
              <th className="text-center">Amount Paid</th>
              <th className="text-center">Pending Amount</th>
              <th className="text-center">Payment Type</th>
              <th className="text-center">Payment Details</th>
              <th className="text-center">Payment Date</th>
              <th className="text-center">Edit</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length > 0 ? (
              purchases.filter(purchase => {
                const matchesCompany = selectedCompany === "" || purchase.companyName === selectedCompany;
                const matchesStatus = selectedPaymentStatus === "" || purchase.paymentStatus === selectedPaymentStatus;
                return matchesCompany && matchesStatus;
              }).map((purchase, index) => (
                <tr key={index}>
                  <td className="table-dark text-center">{index + 1}</td>
                  <td className="table-dark text-center">{purchase.companyName}</td>
                  <td className="table-dark text-center">{purchase.invoiceNo}</td>
                  <td className="table-dark text-center">₹{purchase.salesAmount}</td>
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

                  <td className="table-dark text-center">
                    {purchase.paymentStatus === "Partial" ? (
                      <span>{purchase.paymentType}</span>
                    ) : purchase.paymentStatus === "Paid" ? (
                      <span>{purchase.paymentType}</span>
                    ) : (
                      "-"
                    )}
                  </td>

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
                <td colSpan="27" className="text-center text-light bg-transparent">No Purchase Added Yet</td>
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
                      <option value="Check">Check</option>
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
                        <Form.Label>Check No.</Form.Label>
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
