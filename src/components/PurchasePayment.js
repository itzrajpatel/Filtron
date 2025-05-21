import React, { useState, useEffect } from "react";
import "../styles/Purchase.css";
import { format } from 'date-fns';
import { Modal, Button, Form } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const PurchasePayment = () => {
  const [purchases, setPurchases] = useState([]);

  const handleExportToExcel = () => {
    const exportData = [];

    filteredPurchases.forEach((purchase, index) => {
      const baseInfo = {
        "Sr No.": index + 1,
        "Company Name": purchase.company_name,
        "Invoice No": purchase.invoice_no,
        "Sales Amount": purchase.sales_amount,
        "Payment Status": purchase.payment_status,
        "Amount Paid": purchase.amount_paid,
        "Pending Amount": purchase.payment_status === "Partial"
          ? (purchase.sales_amount - purchase.amount_paid).toFixed(2)
          : purchase.payment_status === "Pending"
          ? purchase.sales_amount
          : 0,
        "Payment Type": purchase.payment_type || "-",
        "Bank Name": purchase.bank_name || "-",
        "Cheque No": purchase.check_no || "-",
        "Transaction ID": purchase.transaction_id || "-",
        "Payment Date": purchase.date_of_payment
          ? format(new Date(purchase.date_of_payment), "dd-MM-yyyy")
          : "-"
      };

      if (purchase.products && Array.isArray(purchase.products)) {
        purchase.products.forEach((product, prodIndex) => {
          exportData.push({
            ...baseInfo,
            "Product No.": prodIndex + 1,
            "Product Code": product.product_code || "-",
            "Product Name": product.product_name || "-",
            "Quantity": product.quantity || "-",
            "Price": product.price || "-"
          });
        });
      } else {
        // In case no products are present
        exportData.push({ ...baseInfo });
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PurchasePayments");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(blob, "PurchasePayments.xlsx");
  };

  // TESTING
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");
  const filteredPurchases = purchases.filter((purchase) => {
    const companyMatch = selectedCompany === "" || purchase.company_name === selectedCompany;
    const statusMatch = selectedPaymentStatus === "" || purchase.payment_status === selectedPaymentStatus;
    return companyMatch && statusMatch;
  });  

  // TESTING
  const handleEditClick = (purchase, index) => {
    setSelectedPurchase({ ...purchase, srNo: index }); // Save index inside selected purchase
    setShowModal(true);
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
    const fieldMap = {
      invoiceDate: "invoice_date",
      invoiceNo: "invoice_no",
      invoiceMonth: "invoice_month",
      typeOfPurchase: "type_of_purchase",
      productCode: "product_code",
      productName: "product_name",
      transportCharge: "transport_charge",
      grandTotal: "grand_total",
      finalTotal: "final_total",
      salesAmount: "sales_amount",
      grossAmount: "gross_amount",
      paymentStatus: "payment_status",
      amountPaid: "amount_paid",
      paymentType: "payment_type",
      bankName: "bank_name",
      checkNo: "check_no",
      transactionId: "transaction_id",
      dateOfPayment: "date_of_payment",
      lrNo: "lr_no",
      transporter: "transporter",
      discount: "discount",
      gst: "gst",
      cgst: "cgst",
      sgst: "sgst",
      igst: "igst",
      tcs: "tcs",
      freight: "freight",
      companyName: "company_name",
      stateCode: "state_code",
      state: "state"
    };
  
    const updated = { ...selectedPurchase };
    const dbField = fieldMap[field] || field; // fallback if field is already in snake_case
  
    if (index === null) {
      updated[dbField] = e.target.value;
  
      if (dbField === "payment_status") {
        updated.amount_paid = updated.payment_status === "Partial" ? updated.amount_paid : "";
        updated.payment_type = "";
        updated.bank_name = "";
        updated.check_no = "";
        updated.transaction_id = "";
      }
    } else {
      updated.products[index][field] = e.target.value;
    }
  
    // ➔ Recalculate totals on important fields
    if (
      (index !== null && (field === "quantity" || field === "price")) ||
      (index === null &&
        (field === "transportCharge" || field === "discount" || field === "tcs" || field === "freight"))
    ) {
      const totals = calculateTotals(updated);
      setSelectedPurchase({ ...updated, ...totals });
    } else {
      setSelectedPurchase(updated);
    }
  };  

  // TESTING
  const handleSave = async () => {
    const original = purchases[selectedPurchase.srNo];
  
    const hasChanged = JSON.stringify(original) !== JSON.stringify(selectedPurchase);
    if (!hasChanged) {
      alert("No changes made.");
      setShowModal(false);
      return;
    }
  
    const purchaseId = original.id;
  
    // Convert camelCase to snake_case
    const payload = {
      companyName: selectedPurchase.company_name,
      state: selectedPurchase.state,
      stateCode: selectedPurchase.state_code,
      typeOfPurchase: selectedPurchase.type_of_purchase,
      productCode: selectedPurchase.product_code,
      productName: selectedPurchase.product_name,
      invoiceNo: selectedPurchase.invoice_no,
      invoiceMonth: selectedPurchase.invoice_month,
      invoiceDate: selectedPurchase.invoice_date,
      discount: selectedPurchase.discount,
      transport: selectedPurchase.transport,
      lrNo: selectedPurchase.lr_no,
      transporter: selectedPurchase.transporter,
      transportCharge: selectedPurchase.transport_charge,
      gst: selectedPurchase.gst,
      cgst: selectedPurchase.cgst,
      sgst: selectedPurchase.sgst,
      igst: selectedPurchase.igst,
      tcs: selectedPurchase.tcs,
      freight: selectedPurchase.freight,
      finalTotal: selectedPurchase.final_total,
      grandTotal: selectedPurchase.grand_total,
      salesAmount: selectedPurchase.sales_amount,
      grossAmount: selectedPurchase.gross_amount,
      paymentStatus: selectedPurchase.payment_status,
      amountPaid: selectedPurchase.amount_paid,
      paymentType: selectedPurchase.payment_type,
      bankName: selectedPurchase.bank_name,
      checkNo: selectedPurchase.check_no,
      transactionId: selectedPurchase.transaction_id,
      dateOfPayment: selectedPurchase.date_of_payment,
      products: selectedPurchase.products,
    };
  
    try {
      const response = await fetch(`http://localhost:5000/api/purchases/${purchaseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        const updated = await fetch("http://localhost:5000/api/purchases");
        const updatedData = await updated.json();
        setPurchases(updatedData);
        setShowModal(false);
        alert("Purchase updated successfully.");
      } else {
        alert("Failed to update purchase.");
      }
    } catch (error) {
      console.error("Update failed:", error);
      alert("Error updating purchase.");
    }
  };  

  // Get Purchase data
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/purchases");
        const data = await response.json();
        setPurchases(data);
      } catch (err) {
        console.error("Failed to fetch purchases:", err);
      }
    };
  
    fetchPurchases();
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
            {[...new Set(purchases.map(p => p.company_name))].map((name, idx) => (
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
            <option value="">Payment Status</option>
            <option value="Pending">Pending</option>
            <option value="Partial">Partial</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
      </div>

      <div className="scroll-container glow-table" style={{ animation: "fadeSlideUp 1.5s ease-out", borderRadius: "14px", overflow: "auto", whiteSpace: "nowrap", scrollbarColor: "white transparent", maxHeight: "800px" }}>
        <table className="table table-bordered table-striped" style={{ border: "1px solid grey" }}>
          <thead className="table-secondary" style={{ border: "1px solid grey" }}>
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
              
              {/* TESTING */}
              <th className="text-center">Edit</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length > 0 ? (
              filteredPurchases.map((purchase, index) => (
                <tr key={index}>
                  <td className="table-dark text-center">{index + 1}</td>
                  <td className="table-dark text-center">{purchase.company_name}</td>
                  <td className="table-dark text-center">{purchase.invoice_no}</td>
                  <td className="table-dark text-center">₹{purchase.sales_amount}</td>
                  <td className="table-dark text-center">
                    <span className={`badge ${purchase.payment_status === "Paid" ? "bg-success" : purchase.payment_status === "Partial" ? "bg-warning" : "bg-danger"}`}>
                        {purchase.payment_status}
                      </span>
                  </td>
                  <td className="table-dark text-center">
                    {purchase.payment_status === "Partial" ? (
                       <span className="text-warning fw-bold">₹{purchase.amount_paid}</span>
                    ) : purchase.payment_status === "Paid" ? (
                      <span className="fw-bold" style={{ color: "lightgreen" }}>₹{purchase.sales_amount}</span>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="table-dark text-center">
                    {purchase.payment_status === "Partial" ? (
                      <span className="text-danger fw-bold">₹{purchase.sales_amount - purchase.amount_paid}</span>
                    ) : purchase.payment_status === "Pending" ? (
                      <span className="text-danger fw-bold">₹{purchase.sales_amount}</span>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="table-dark text-center">
                    {purchase.payment_status === "Partial" ? (
                      <span>{purchase.payment_type}</span>
                    ) : purchase.payment_status === "Paid" ? (
                      <span>{purchase.payment_type}</span>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="table-dark text-center">
                    {purchase.payment_type === "Check" ? (
                      <span>
                        {purchase.bank_name && <div>Bank: {purchase.bank_name}</div>}
                        {purchase.check_no && <div>Cheque No: {purchase.check_no}</div>}
                        {purchase.transaction_id && <div>Txn: {purchase.transaction_id}</div>}
                      </span>
                    ) : purchase.payment_type === "Online" ? (
                      <span>
                        {purchase.bank_name && <div>Bank: {purchase.bank_name}</div>}
                        {purchase.check_no && <div>Cheque No: {purchase.check_no}</div>}
                        {purchase.transaction_id && <div>Txn: {purchase.transaction_id}</div>}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* <td className="table-dark text-center">
                    {(purchase.payment_status === "Partial" || purchase.payment_status === "Paid") && purchase.date_of_payment ? (
                      <span>{purchase.date_of_payment}</span>
                    ) : (
                      "-"
                    )}
                  </td> */}
                  <td className="table-dark text-center">
                    {(purchase.payment_status === "Partial" || purchase.payment_status === "Paid") && purchase.date_of_payment ? (
                      <span>{format(new Date(purchase.date_of_payment), "dd-MM-yyyy")}</span>
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
      <div className="text-center mt-4 mb-4">
        <button
          className="btn btn-primary glow-button glow-table"
          onClick={handleExportToExcel}
          style={{
            animation: "fadeSlideUp 1.5s ease-out",
            background: "transparent",
            color: "#fff",
            padding: "12px 24px",
            fontWeight: "600",
            fontSize: "16px",
            cursor: "pointer"
          }}
        >
          Save File <FontAwesomeIcon icon={faSave} style={{ color: "#74C0FC", marginLeft: "10px", fontSize: "18px" }} />
      
        </button>
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
                  value={selectedPurchase.payment_status}
                  onChange={(e) => handleChange(e, null, "paymentStatus")}
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                </Form.Select>
              </Form.Group>

              {selectedPurchase.payment_status === "Partial" && (
                <Form.Group className="mt-3">
                  <Form.Label>Amount Paid</Form.Label>
                  <Form.Control
                    type="number"
                    value={selectedPurchase.amount_paid}
                    onChange={(e) => handleChange(e, null, "amountPaid")}
                    onWheel={(e) => e.target.blur()}
                  />
                </Form.Group>
              )}

              {["Paid", "Partial"].includes(selectedPurchase.payment_status) && (
                <>
                  <Form.Group className="mt-3">
                    <Form.Label>Payment Type</Form.Label>
                    <Form.Select
                      value={selectedPurchase.payment_type || ""}
                      onChange={(e) => handleChange(e, null, "paymentType")}
                    >
                      <option value="">Select Payment Type</option>
                      <option value="Cash">Cash</option>
                      <option value="Check">Cheque</option>
                      <option value="Online">Online</option>
                    </Form.Select>
                  </Form.Group>

                  {selectedPurchase.payment_type === "Check" && (
                    <>
                      <Form.Group className="mt-3">
                        <Form.Label>Bank Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={selectedPurchase.bank_name || ""}
                          onChange={(e) => handleChange(e, null, "bankName")}
                        />
                      </Form.Group>
                      <Form.Group className="mt-3">
                        <Form.Label>Cheque No.</Form.Label>
                        <Form.Control
                          type="text"
                          value={selectedPurchase.check_no || ""}
                          onChange={(e) => handleChange(e, null, "checkNo")}
                        />
                      </Form.Group>
                    </>
                  )}

                  {selectedPurchase.payment_type === "Online" && (
                    <Form.Group className="mt-3">
                      <Form.Label>Transaction ID</Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedPurchase.transaction_id || ""}
                        onChange={(e) => handleChange(e, null, "transactionId")}
                      />
                    </Form.Group>
                  )}

                  <Form.Group className="mt-3">
                    <Form.Label>Date of Payment</Form.Label>
                    <Form.Control
                      type="date"
                      value={selectedPurchase.date_of_payment}
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

export default PurchasePayment;
