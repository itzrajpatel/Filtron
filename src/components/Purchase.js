import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Purchase.css";
import { format } from 'date-fns';
import { Modal, Button, Form } from "react-bootstrap";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';

const Purchase = () => {
  const [purchases, setPurchases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleExportToExcel = () => {
    const exportData = [];

    purchases.forEach((purchase, index) => {
      const totals = calculateTotals(purchase);
      purchase.products.forEach((product, i) => {
        exportData.push({
          "Sr No.": index + 1,
          "Company Name": purchase.company_name,
          "State": purchase.state,
          "State Code": purchase.state_code,
          "Invoice No": purchase.invoice_no,
          "Invoice Date": purchase.invoice_date,
          "Invoice Month": purchase.invoice_month,
          "Type of Purchase": purchase.type_of_purchase,
          "HSN No.": product.hsnNo,
          "Product Description": product.productDescription,
          "Item Name": purchase.product_name,
          "Item Code": purchase.product_code,
          "Quantity": product.quantity,
          "Unit": product.unit,
          "Price": product.price,
          "Total": (product.quantity * product.price).toFixed(2),
          "Discount": purchase.discount,
          "Transport Charge": purchase.transport_charge,
          "TCS": purchase.tcs,
          "Freight": purchase.freight,
          "Final Total": totals.final_total,
          "Grand Total": totals.grand_total,
          "GST (%)": purchase.gst,
          "CGST": totals.cgst,
          "SGST": totals.sgst,
          "IGST": totals.igst,
          "Sales Amount": totals.sales_amount,
          "Gross Amount": totals.gross_amount,
          "Payment Status": purchase.payment_status,
          "Amount Paid": purchase.amount_paid,
          "Pending Amount":
            purchase.payment_status === "Partial"
              ? (purchase.sales_amount - purchase.amount_paid).toFixed(2)
              : purchase.payment_status === "Pending"
              ? purchase.sales_amount
              : 0,
          "Payment Type": purchase.payment_type,
          "Bank Name": purchase.bank_name,
          "Check No": purchase.check_no,
          "Transaction ID": purchase.transaction_id,
          "Date of Payment": purchase.date_of_payment,
          "Transport": purchase.transport,
          "Transporter": purchase.transporter,
          "LR No.": purchase.lr_no,
        });
      });
    });

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Details");

    // Generate and save Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "PurchaseDetails.xlsx");
  };

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
  
    const transportCharge = parseFloat(purchase.transport_charge || 0);
    const discount = parseFloat(purchase.discount || 0);
    const tcs = parseFloat(purchase.tcs || 0);
    const freight = parseFloat(purchase.freight || 0);
  
    const grandTotal = finalTotal + transportCharge - discount;
  
    const gstRate = purchase.gst ? parseFloat(purchase.gst.replace("%", "")) / 100 : 0;
    const isGujarat = purchase.state_code === "24";
  
    const cgst = isGujarat ? (grandTotal * gstRate) / 2 : 0;
    const sgst = isGujarat ? (grandTotal * gstRate) / 2 : 0;
    const igst = !isGujarat ? grandTotal * gstRate : 0;
  
    const gstTotal = cgst + sgst + igst;
    const salesAmount = grandTotal + gstTotal + tcs;
    const grossAmount = salesAmount + freight;
  
    return {
      final_total: finalTotal.toFixed(2),
      grand_total: grandTotal.toFixed(2),
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      igst: igst.toFixed(2),
      sales_amount: salesAmount.toFixed(2),
      gross_amount: grossAmount.toFixed(2),
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
    const dbField = fieldMap[field] || field;
  
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
  
      // 🧮 Calculate product total on quantity/price change
      if (["quantity", "price"].includes(field)) {
        const qty = parseFloat(updated.products[index].quantity) || 0;
        const price = parseFloat(updated.products[index].price) || 0;
        updated.products[index].total = (qty * price).toFixed(2);
      }
    }
  
    // 🔁 Recalculate totals on all relevant fields
    const recalcFields = ["quantity", "price", "transportCharge", "discount", "tcs", "freight", "gst"];
    if (
      (index !== null && recalcFields.includes(field)) ||
      (index === null && recalcFields.includes(field))
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
        <h2 className="mt-3" style={{ color: "white", fontFamily: "DM Serif Text, serif", animation: "fadeSlideUp 1.5s ease-out" }}>Purchase Details</h2>
        <button
          className="btn btn-primary glow-button glow-table"
          onClick={() => navigate("/purchase/add-purchase")}
          style={{ animation: "fadeSlideUp 1.5s ease-out", background: "transparent", color: "#fff", padding: "12px 24px", fontWeight: "600", fontSize: "16px", cursor: "pointer" }}
        >
          + Add Purchase
        </button>
      </div>

      <div className="mb-3" style={{ animation: "fadeSlideUp 1.5s ease-out" }}>
        <input
          type="text"
          className="form-control"
          placeholder="🔍  Search by Purchase, Company, Item, Item Code, Invoice"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: "400px" }}
        />
      </div>

      <div className="scroll-container glow-table" style={{ animation: "fadeSlideUp 1.5s ease-out", borderRadius: "14px", overflow: "auto", whiteSpace: "nowrap", scrollbarColor: "white transparent", maxHeight: "800px" }}>
        <table className="table table-bordered table-striped" style={{ border: "1px solid grey" }}>
          <thead className="table-secondary" style={{ border: "1px solid grey" }}>
            <tr>
              <th className="text-center">Sr No.</th>
              <th className="text-center">Date</th>
              <th className="text-center">Type of Purchase</th>
              <th className="text-center">Company Name</th>
              <th className="text-center">Location</th>
              <th className="text-center">State Code</th>
              <th className="text-center">Item Name</th>
              <th className="text-center">Item Code</th>
              <th className="text-center">Invoice No</th>
              <th className="text-center">Invoice Date</th>
              <th className="text-center">Invoice Month</th>
              <th className="text-center">HSN No.</th>
              <th className="text-center">Item Details</th>
              <th className="text-center">Quantity</th>
              <th className="text-center">Unit</th>
              <th className="text-center">Price</th>
              <th className="text-center">Final Total</th>
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
              <th className="text-center">Edit</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length > 0 ? (
              purchases.filter((purchase) => {
                const lower = searchTerm.toLowerCase();
                return (
                  purchase.type_of_purchase?.toLowerCase().includes(lower) ||
                  purchase.company_name?.toLowerCase().includes(lower) ||
                  purchase.product_name?.toLowerCase().includes(lower) ||
                  purchase.product_code?.toLowerCase().includes(lower) ||
                  purchase.invoice_no?.toLowerCase().includes(lower)
                );
              }).map((purchase, index) => (
                <tr key={index}>
                  <td className="table-dark text-center">{index + 1}</td>
                  <td className="table-dark text-center">
                    {purchase.created_at ? format(new Date(purchase.created_at), "yyyy-MM-dd") : ""}
                  </td>
                  <td className="table-dark text-center">{purchase.type_of_purchase}</td>
                  <td className="table-dark text-center">{purchase.company_name}</td>
                  <td className="table-dark text-center">{purchase.state}</td>
                  <td className="table-dark text-center">{purchase.state_code}</td>
                  <td className="table-dark text-center">{purchase.product_name}</td>
                  <td className="table-dark text-center">{purchase.product_code}</td>
                  <td className="table-dark text-center">{purchase.invoice_no}</td>
                  <td className="table-dark text-center">
                    {purchase.invoice_date ? format(new Date(purchase.invoice_date), "yyyy-MM-dd") : ""}
                  </td>

                  <td className="table-dark text-center">{purchase.invoice_month}</td>

                  <td className="table-dark text-center">
                    {purchase.products.map((product, i) => (
                      <div key={i}>{product.hsnNo}{i !== purchase.products.length - 1 && <hr />}</div>
                    ))}
                  </td>

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

                  <td className="table-dark text-center">₹{purchase.final_total}</td>
                  <td className="table-dark text-center">₹{purchase.transport_charge}</td>
                  <td className="table-dark text-center">₹{purchase.discount}</td>
                  <td className="table-dark text-center">₹{purchase.grand_total}</td>
                  <td className="table-dark text-center">{purchase.gst}</td>
                  <td className="table-dark text-center">₹{purchase.cgst}</td>
                  <td className="table-dark text-center">₹{purchase.sgst}</td>
                  <td className="table-dark text-center">₹{purchase.igst}</td>
                  <td className="table-dark text-center">₹{purchase.tcs}</td>
                  <td className="table-dark text-center">₹{purchase.sales_amount}</td>
                  <td className="table-dark text-center">₹{purchase.freight}</td>
                  <td className="table-dark text-center">₹{purchase.gross_amount}</td>
                  <td className="table-dark text-center">{purchase.transport}</td>
                  <td className="table-dark text-center">{purchase.transporter}</td>
                  <td className="table-dark text-center">{purchase.lr_no}</td>
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
                      <span>{format(new Date(purchase.date_of_payment), "yyyy-MM-dd")}</span>
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
                <Form.Label>Type of Purchase</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedPurchase.type_of_purchase}
                  onChange={(e) => handleChange(e, null, "typeOfPurchase")}
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Invoice No</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedPurchase.invoice_no}
                  onChange={(e) => handleChange(e, null, "invoiceNo")}
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Invoice Date</Form.Label>
                <Form.Control
                  type="date"
                  value={selectedPurchase.invoice_date}
                  onChange={(e) => handleChange(e, null, "invoiceDate")}
                />
              </Form.Group>

              {/* <Form.Group className="mt-3">
                <Form.Label>Invoice Month</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedPurchase.invoice_month}
                  onChange={(e) => handleChange(e, null, "invoiceMonth")}
                />
              </Form.Group> */}
              <Form.Group className="mt-3">
                <Form.Label>Invoice Month</Form.Label>
                <Form.Select
                  value={selectedPurchase.invoice_month}
                  onChange={(e) => handleChange(e, null, "invoiceMonth")}
                >
                  <option value="">Select Month</option>
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>Item Name</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedPurchase.product_name}
                  onChange={(e) => handleChange(e, null, "productName")}
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Item Code</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedPurchase.product_code}
                  onChange={(e) => handleChange(e, null, "productCode")}
                />
              </Form.Group>

              {selectedPurchase.products.map((product, index) => (
                <div className="mt-3 border rounded p-2 position-relative" key={index}>
                  <Form.Group>
                    <Form.Label>Item Description</Form.Label>
                    <Form.Control
                      type="text"
                      value={product.productDescription}
                      onChange={(e) => handleChange(e, index, "productDescription")}
                    />
                  </Form.Group>

                  <Form.Group className="mt-3">
                    <Form.Label>HSN No.</Form.Label>
                    <Form.Control
                      type="number"
                      value={product.hsnNo}
                      onChange={(e) => handleChange(e, index, "hsnNo")}
                      onWheel={(e) => e.target.blur()}
                    />
                  </Form.Group>

                  <Form.Group className="mt-3">
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      value={product.quantity}
                      onChange={(e) => handleChange(e, index, "quantity")}
                      onWheel={(e) => e.target.blur()}
                    />
                  </Form.Group>

                  <Form.Group className="mt-3">
                    <Form.Label>Unit</Form.Label>
                    <Form.Control
                      type="text"
                      value={product.unit}
                      onChange={(e) => handleChange(e, index, "unit")}
                    />
                  </Form.Group>

                  <Form.Group className="mt-3">
                    <Form.Label>Price</Form.Label>
                    <Form.Control
                      type="number"
                      value={product.price}
                      onChange={(e) => handleChange(e, index, "price")}
                      onWheel={(e) => e.target.blur()}
                    />
                  </Form.Group>

                  {/* ➖ Remove Button */}
                  {selectedPurchase.products.length > 1 && (
                    <Button
                      type="button"
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
                  type="button"
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
                  value={selectedPurchase.transport_charge}
                  onChange={(e) => handleChange(e, null, "transportCharge")}
                  onWheel={(e) => e.target.blur()}
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Discount</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedPurchase.discount}
                  onChange={(e) => handleChange(e, null, "discount")}
                  onWheel={(e) => e.target.blur()}
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>TCS</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedPurchase.tcs}
                  onChange={(e) => handleChange(e, null, "tcs")}
                  onWheel={(e) => e.target.blur()}
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Freight</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedPurchase.freight}
                  onChange={(e) => handleChange(e, null, "freight")}
                  onWheel={(e) => e.target.blur()}
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
                  value={selectedPurchase.lr_no}
                  onChange={(e) => handleChange(e, null, "lrNo")}
                />
              </Form.Group>

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

export default Purchase;
