import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import "../styles/Orders.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // TESTING
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  //TESTING
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/orders");
        const data = await res.json();
  
        const formatted = data.map(order => ({
          ...order,
          id: order.id, // ✅ include this
          invoiceNo: order.invoice_no,
          invoiceDate: order.invoice_date,
          invoiceMonth: order.invoice_month,
          companyName: order.company_name,
          customerName: order.customer_name,
          products: order.products || [],
          cancelled: order.cancelled || false,
          amountPaid: order.payment_status === "Partial" ? order.amount_paid : "",
          paymentStatus: order.payment_status,
          paymentType: order.payment_type,
          bankName: order.bank_name,
          checkNo: order.check_no,
          transactionId: order.transaction_id,
          transportPrice: order.transport_price,
          finalTotal: order.final_total,
          grandTotal: order.grand_total,
          salesAmount: order.sales_amount,
          paymentDate: order.payment_date,
        }));
  
        setOrders(formatted);
      } catch (err) {
        console.error("Failed to fetch Invoice:", err);
      }
    };
  
    fetchOrders();
  }, []);    

  // Function to handle redirection
  const handleViewOrder = (companyName) => {
    navigate("/invoice/view-invoice", { state: { companyName } });
  };  

  // Handle edit button click
  const handleEditClick = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Handle field changes
  const handleChange = (e, index, field) => {
    const value = e.target.value;
    const updatedOrder = { ...selectedOrder };
  
    if (index === null) {
      updatedOrder[field] = value;
  
      if (field === "paymentStatus") {
        updatedOrder.amountPaid = value === "Partial" ? updatedOrder.amountPaid : "";
        updatedOrder.paymentType = "";
        updatedOrder.bankName = "";
        updatedOrder.checkNo = "";
        updatedOrder.transactionId = "";
      }
    } else {
      updatedOrder.products[index][field] = value;
  
      if (field === "quantity" || field === "price") {
        const quantity = parseFloat(updatedOrder.products[index].quantity) || 0;
        const price = parseFloat(updatedOrder.products[index].price) || 0;
        updatedOrder.products[index].total = (quantity * price).toFixed(2);
      }
    }
  
    const totals = calculateTotals(updatedOrder);
    setSelectedOrder({ ...updatedOrder, ...totals });
  };    

  // Save updated details
  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_date: selectedOrder.invoiceDate,
          invoice_month: selectedOrder.invoiceMonth,
          payment_status: selectedOrder.paymentStatus,
          amount_paid: selectedOrder.amountPaid,
          payment_type: selectedOrder.paymentType,
          bank_name: selectedOrder.bankName,
          check_no: selectedOrder.checkNo,
          transaction_id: selectedOrder.transactionId,
          transport: selectedOrder.transport,
          transport_price: selectedOrder.transportPrice,
          final_total: selectedOrder.finalTotal,
          grand_total: selectedOrder.grandTotal,
          sales_amount: selectedOrder.salesAmount,
          gst: selectedOrder.gst,
          cgst: selectedOrder.cgst,
          sgst: selectedOrder.sgst,
          igst: selectedOrder.igst,
          products: selectedOrder.products,
          payment_date: selectedOrder.paymentDate,
        })
      });
  
      if (response.ok) {
        toast.success("Invoice updated successfully!");
  
        const updatedOrders = orders.map(order =>
          order.id === selectedOrder.id ? selectedOrder : order
        );
        setOrders(updatedOrders);
        setShowModal(false);
      } else {
        toast.error("Failed to update Invoice.");
      }
    } catch (err) {
      console.error("Error updating Invoice:", err);
      toast.error("Server error occurred.");
    }
  };  

  const calculateTotals = (order) => {
  const finalTotalRaw = order.products.reduce((sum, p) => {
    const qty = parseFloat(p.quantity) || 0;
    const price = parseFloat(p.price) || 0;
    return sum + qty * price;
  }, 0);

  const transportPrice = order.transport === "Yes" && order.transportPrice
    ? parseFloat(order.transportPrice) || 0
    : 0;

  const grandTotalRaw = finalTotalRaw + transportPrice;

  const gstRate = order.gst ? parseFloat(order.gst.replace("%", "")) / 100 : 0;
  const isGujarat = selectedOrder?.state_code === "24";

  const cgst = isGujarat ? (grandTotalRaw * gstRate) / 2 : 0;
  const sgst = isGujarat ? (grandTotalRaw * gstRate) / 2 : 0;
  const igst = !isGujarat ? grandTotalRaw * gstRate : 0;

  const salesAmountRaw = grandTotalRaw + cgst + sgst + igst;

  // Custom rounding function: round up if decimal ≥ 0.5, else round down
  const customRound = (num) => {
    const decimal = num - Math.floor(num);
    return decimal >= 0.5 ? Math.ceil(num) : Math.floor(num);
  };

  return {
    finalTotal: customRound(finalTotalRaw),
    grandTotal: customRound(grandTotalRaw),
    cgst: cgst.toFixed(2),
    sgst: sgst.toFixed(2),
    igst: igst.toFixed(2),
    salesAmount: customRound(salesAmountRaw),
  };
};

  const handleCancelOrder = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderToCancel.id}/cancel`, {
        method: "PUT"
      });
  
      if (res.ok) {
        const updatedOrders = orders.map(order =>
          order.id === orderToCancel.id ? { ...order, cancelled: true } : order
        );
        setOrders(updatedOrders);
        toast.success("Invoice cancelled successfully.");
      } else {
        toast.error("Failed to cancel invoice.");
      }
    } catch (err) {
      console.error("Error cancelling Invoice:", err);
      toast.error("Server error occurred.");
    }
    setShowCancelModal(false);
  };

  // Save & download in "xlsx" format
  const handleExportToExcel = () => {
    const dataToExport = [];

    const filteredOrders = orders.filter(order => {
      const matchesCompany = selectedCompany === "" || order.company_name === selectedCompany;
      const matchesStatus = selectedPaymentStatus === "" || order.paymentStatus === selectedPaymentStatus;
      const isNotCancelled = !order.cancelled;
      return matchesCompany && matchesStatus && isNotCancelled;
    });

    filteredOrders.forEach((order, index) => {
      const hsnList = order.products.map(p => p.hsnNo || "-").join("\n\n");
      const productDetailsList = order.products.map(p => p.productDetails || "-").join("\n\n");
      const quantityList = order.products.map(p => p.quantity || "-").join("\n\n");
      const unitList = order.products.map(p => p.unit || "-").join("\n\n");
      const priceList = order.products.map(p => p.price || "-").join("\n\n");
      const totalList = order.products.map(p => p.total || "-").join("\n\n");

      dataToExport.push({
        SrNo: index + 1,
        InvoiceNo: order.invoiceNo,
        InvoiceDate: order.invoiceDate,
        InvoiceMonth: order.invoiceMonth,
        CompanyName: order.companyName,
        CustomerName: order.customerName,
        HSNNo: hsnList,
        ProductDetails: productDetailsList,
        Quantity: quantityList,
        Unit: unitList,
        Price: priceList,
        Total: totalList,
        FinalTotal: order.finalTotal,
        Transport: order.transport,
        TransportPrice: order.transportPrice,
        GST: order.gst,
        CGST: order.cgst,
        SGST: order.sgst,
        IGST: order.igst,
        SalesAmount: order.salesAmount,
        JobWorkOrSupplier: order.job_work_supplier,
        PaymentStatus: order.paymentStatus,
        AmountPaid: order.amountPaid,
        AmountPending: order.paymentStatus === "Partial"
          ? (order.salesAmount - order.amountPaid).toFixed(2)
          : order.paymentStatus === "Pending"
          ? order.salesAmount
          : "0",
        PaymentType: order.paymentType,
        BankName: order.bankName,
        CheckNo: order.checkNo,
        TransactionId: order.transactionId,
        PaymentDate: order.paymentDate || "-",
        Cancelled: order.cancelled ? "Yes" : "No"
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(fileData, "Invoice.xlsx");
  };

  // Save & download in "pdf" format
  const handleExportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    const tableColumn = [
      "Sr No", "Invoice No", "Invoice Date", "Customer", "HSN", "Description", "Qty", "Unit", "Price",
      "Final Total", "GST", "CGST", "SGST", "IGST", "Sales Amount"
    ];

    const tableRows = [];

    const filteredOrders = orders.filter(order => {
      const matchesCompany = selectedCompany === "" || order.company_name === selectedCompany;
      const matchesStatus = selectedPaymentStatus === "" || order.paymentStatus === selectedPaymentStatus;
      const isNotCancelled = !order.cancelled;
      return matchesCompany && matchesStatus && isNotCancelled;
    });

    filteredOrders.forEach((order, index) => {
      const hsnList = order.products.map(p => p.hsnNo || "-").join("\n\n");
      const productDetailsList = order.products.map(p => p.productDetails || "-").join("\n\n");
      const quantityList = order.products.map(p => p.quantity || "-").join("\n\n");
      const unitList = order.products.map(p => p.unit || "-").join("\n\n");
      const priceList = order.products.map(p => p.price || "-").join("\n\n");

      tableRows.push([
        index + 1,
        order.invoiceNo,
        order.invoiceDate,
        order.companyName,
        hsnList,
        productDetailsList,
        quantityList,
        unitList,
        priceList,
        order.finalTotal,
        order.gst,
        order.cgst,
        order.sgst,
        order.igst,
        order.salesAmount,
      ]);
    });


    doc.text("Invoice Report", 14, 15);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [52, 73, 94] }
    });

    doc.save("Invoice.pdf");
  };

  return (
    <div className="container mt-4">
      <ToastContainer />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mt-3" style={{ color: "white", fontFamily: "DM Serif Text, serif", animation: "fadeSlideUp 1.5s ease-out" }}>Invoice Details</h2>
        <button className="btn btn-primary glow-button glow-table" onClick={() => navigate("/invoice/add-invoice")} style={{ animation: "fadeSlideUp 1.5s ease-out", background: "transparent", color: "#fff", padding: "12px 24px", fontWeight: "600", fontSize: "16px", cursor: "pointer" }}>
          + Add Invoice
        </button>
      </div>

      {/* Filter */}
      <div className="d-flex gap-3 mb-4" style={{ animation: "fadeSlideUp 1.5s ease-out" }}>
        <div>
          <select
            className="form-select"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
          >
            <option value="">All Companies</option>
            {[...new Set(orders.map(order => order.company_name))].map((name, idx) => (
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
            <option value="Paid">Received</option>
          </select>
        </div>
      </div>

      {/* Make the table horizontally scrollable */}
      <div className="scroll-container glow-table" style={{ animation: "fadeSlideUp 1.5s ease-out", borderRadius: "14px", overflow: "auto", whiteSpace: "nowrap", scrollbarColor: "white transparent", maxHeight: "800px" }}>
        <table className="table table-bordered table-striped" style={{ border: "1px solid grey" }}>
          <thead className="table-secondary" style={{ border: "1px solid grey" }}>
            <tr>
              <th className="text-center" style={{ paddingBottom: "20px" }}>Sr No.</th>
              <th className="text-center" style={{ paddingBottom: "20px" }}>Invoice No.</th>
              <th className="text-center" style={{ paddingBottom: "20px" }}>Invoice Date</th>
              <th className="text-center" style={{ whiteSpace: "wrap" }}>Invoice Month</th>
              <th className="text-center" style={{ paddingBottom: "20px" }}>Company Name</th>
              <th className="text-center" style={{ paddingBottom: "20px" }}>HSN No.</th>
              <th className="text-center" style={{ paddingBottom: "20px" }}>Product Details</th>
              <th className="text-center" style={{ paddingBottom: "20px" }}>Quantity</th>
              <th className="text-center" style={{ paddingBottom: "20px" }}>Unit</th>
              <th className="text-center" style={{ paddingBottom: "20px" }}>Price</th>
              <th className="text-center" style={{ paddingBottom: "20px" }}>Final Total</th>
              <th className="text-center" style={{ whiteSpace: "wrap" }}>Transport Charge</th>
              <th className="text-center" style={{ paddingBottom: "20px" }}>GST</th>
              <th className="text-center" style={{ paddingBottom: "20px" }}>CGST</th>
              <th className="text-center" style={{ paddingBottom: "20px" }}>SGST</th>
              <th className="text-center" style={{ paddingBottom: "20px" }}>IGST</th>
              <th className="text-center" style={{ paddingBottom: "20px" }}>Sales Amount</th>
              <th className="text-center" style={{ paddingBottom: "20px" }}>Job Work / Supplier</th>
              <th className="text-center" style={{ paddingBottom: "20px" }}>Payment Status</th>
              <th className="text-center" style={{ paddingBottom: "20px" }}>Amount Received</th>
              <th className="text-center" style={{ paddingBottom: "20px" }}>Amount Pending</th>
              <th className="text-center" style={{ paddingBottom: "20px" }}>Payment Type</th>
              <th className="text-center" style={{ paddingBottom: "20px" }}>Payment Details</th>
              <th className="text-center" style={{ paddingBottom: "20px" }}>Payment Date</th>
              <th className="text-center" style={{ paddingBottom: "20px" }}>Edit Invoice</th>
              <th className="text-center" style={{ paddingBottom: "20px" }}>Cancel Invoice</th>
              <th className="text-center" style={{ paddingBottom: "20px" }}>Create Invoice</th>
              <th className="text-center" style={{ paddingBottom: "20px" }}>Create Chalan</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders
              .filter(order => {
                const matchesCompany = selectedCompany === "" || order.company_name === selectedCompany;
                const matchesStatus = selectedPaymentStatus === "" || order.paymentStatus === selectedPaymentStatus;
                return matchesCompany && matchesStatus;
              })
              .map((order, index) => {
                return (
                  <tr key={index} style={order.cancelled ? { opacity: 0.5, textDecoration: "line-through", textDecorationColor: "#FF073A" } : {}}>
                    <td className="table-dark text-center">{index + 1}</td>
                    <td className="table-dark text-center">{order.invoice_no}</td>
                    <td className="table-dark text-center">{order.invoice_date}</td>
                    <td className="table-dark text-center">{order.invoice_month}</td>
                    <td className="table-dark text-center">
                      {order.cancelled ? (
                        <span
                          style={{ color: "lightgrey", cursor: "not-allowed" }}
                          title="This invoice is cancelled"
                        >
                          {order.company_name}
                        </span>
                      ) : (
                        <span 
                          onClick={() => handleViewOrder(order.company_name)}
                          style={{ cursor: "pointer", color: "white", textDecoration: "none" }}
                          onMouseOver={(e) => e.target.style.color = "red"}
                          onMouseOut={(e) => e.target.style.color = "white"}
                          title="Click to view Invoice Details"
                        >
                          {order.company_name}
                        </span>
                      )}
                    </td>

                    <td className="table-dark text-center">
                      {order.products.map((product, i) => (
                        <div key={i} className="text-center">
                          {product.hsnNo}
                          {i !== order.products.length - 1 && <hr />}
                        </div>
                      ))}
                    </td>

                    <td className="table-dark text-center">
                      {order.products.map((product, i) => (
                        <div 
                          key={i} 
                          style={{ 
                            maxWidth: "250px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }} 
                          title={product.productDetails} // Shows full text on hover
                        >
                          {product.productDetails}
                          {i !== order.products.length - 1 && <hr />}
                        </div>
                      ))}
                    </td>

                    <td className="table-dark text-center">
                      {order.products.map((product, i) => (
                        <div key={i} className="text-center" sty>
                          {product.quantity}
                          {i !== order.products.length - 1 && <hr />}
                        </div>
                      ))}
                    </td>
                    
                    <td className="table-dark text-center">
                      {order.products.map((product, i) => (
                        <div key={i} className="text-center">
                          {product.unit}
                          {i !== order.products.length - 1 && <hr />}
                        </div>
                      ))}
                    </td>

                    <td className="table-dark text-center">
                      {order.products.map((product, i) => (
                        <div key={i} className="text-center">
                          ₹{product.price}
                          {i !== order.products.length - 1 && <hr />}
                        </div>
                      ))}
                    </td>

                    <td className="table-dark text-center">{order.finalTotal}</td>
                    <td className="table-dark text-center">{order.transport === "Yes" ? `₹${order.transportPrice}` : "-"}</td>
                    <td className="table-dark text-center">{order.gst}</td>
                    <td className="table-dark text-center">₹{order.cgst}</td>
                    <td className="table-dark text-center">₹{order.sgst}</td>
                    <td className="table-dark text-center">₹{order.igst}</td>
                    <td className="table-dark text-center">₹{order.salesAmount}</td>
                    <td className="table-dark text-center">{order.job_work_supplier !== "" ? `${order.job_work_supplier}` : "-"}</td>
                    <td className="table-dark text-center">
                      <span className={`badge ${order.cancelled ? "bg-secondary" : order.payment_status === "Paid"
                        ? "bg-success"
                        : order.payment_status === "Partial"
                        ? "bg-warning"
                        : "bg-danger"}`}>
                        {order.cancelled ? "Cancelled" : order.payment_status}
                      </span>
                    </td>
                    <td className="table-dark text-center">
                      {order.paymentStatus === "Partial" ? (
                        <span className="text-warning fw-bold">₹{order.amountPaid}</span>
                      ) : order.paymentStatus === "Paid" ? (
                        <span className="fw-bold" style={{ color: "lightgreen" }}>{order.salesAmount}</span>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="table-dark text-center">
                      {order.paymentStatus === "Partial" ? (
                        <span className="text-danger fw-bold">₹{order.salesAmount - order.amountPaid}</span>
                      ) : order.paymentStatus === "Pending" ? (
                        <span className="text-danger fw-bold">{order.salesAmount}</span>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* TESTING */}
                    <td className="table-dark text-center">{order.paymentType || "-"}</td>
                    <td className="table-dark text-center">
                      {order.paymentType === "Check" ? (
                        <>
                          <div><strong>Bank:</strong> {order.bankName}</div>
                          <div><strong>Check No:</strong> {order.checkNo}</div>
                        </>
                      ) : order.paymentType === "Online" ? (
                        <div><strong>Txn ID:</strong> {order.transactionId}</div>
                      ) : order.paymentType === "Cash" ? (
                        "-"
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="table-dark text-center">
                      {order.paymentDate ? new Date(order.paymentDate).toISOString().split("T")[0] : "-"}
                    </td>
                    <td className="table-dark text-center">
                      <button className="btn btn-info" onClick={() => handleEditClick(order)} disabled={order.cancelled}>
                        Edit
                      </button>
                    </td>
                    <td className="table-dark text-center">
                      <button
                        className="btn btn-danger"
                        onClick={() => {
                          setOrderToCancel(order);
                          setShowCancelModal(true);
                        }}
                        disabled={order.cancelled}
                      >
                        {order.cancelled ? "Cancelled" : "Cancel"}
                      </button>
                    </td>
                    <td className="table-dark text-center">
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          navigate("/create-bill", { state: { orderId: order.id } });
                        }}
                        disabled={order.cancelled}
                      >
                        Create Bill
                      </button>
                    </td>
                    <td className="table-dark text-center">
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          navigate("/create-chalan", { state: { orderId: order.id } });
                        }}                        
                        disabled={order.cancelled}
                      >
                        Create Chalan
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="18" className="text-center bg-dark text-light">No Invoice added yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* TESTING */}
      <div className="text-center mt-4 mb-4">
        
        {/* Save to xlsx */}
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
          Save to Excel <FontAwesomeIcon icon={faSave} style={{ color: "#74C0FC", marginLeft: "10px", fontSize: "18px" }} />

        </button>

        {/* Save to PDF */}
        <button
          className="btn btn-danger glow-button glow-table ms-3"
          onClick={handleExportToPDF}
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
          Save to PDF <FontAwesomeIcon icon={faSave} style={{ color: "#FF6B6B", marginLeft: "10px", fontSize: "18px" }} />
        </button>
      </div>
      
      {/* Bootstrap Modal for Editing Invoice */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-dark text-light custom-close">
          <Modal.Title>Edit Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          {selectedOrder && (
            <Form>
            <Form.Group>
              <Form.Label>Invoice Date</Form.Label>
              <Form.Control
                type="date"
                value={selectedOrder.invoiceDate}
                onChange={(e) => handleChange(e, null, "invoiceDate")}
              />
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Invoice Month</Form.Label>
              <Form.Control
                type="text"
                value={selectedOrder.invoiceMonth}
                onChange={(e) => handleChange(e, null, "invoiceMonth")}
              />
            </Form.Group>
          
            {selectedOrder.products.map((product, index) => (
              <div className="mt-3 border rounded p-3" key={index}>
                <Form.Group>
                  <Form.Label>Product Details - {index + 1}</Form.Label>
                  <Form.Control
                    type="text"
                    value={product.productDetails}
                    onChange={(e) => handleChange(e, index, "productDetails")}
                  />
                </Form.Group>

                <Form.Group className="mt-3">
                  <Form.Label>HSN No.</Form.Label>
                  <Form.Control
                    type="text"
                    value={product.hsnNo}
                    onChange={(e) => handleChange(e, index, "hsnNo")}
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
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    value={product.price}
                    onChange={(e) => handleChange(e, index, "price")}
                    onWheel={(e) => e.target.blur()}
                  />
                </Form.Group>
              </div>
            ))}
          
            <Form.Group className="mt-3">
              <Form.Label>Transport</Form.Label>
              <Form.Select
                value={selectedOrder.transport}
                onChange={(e) => handleChange(e, null, "transport")}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </Form.Select>
            </Form.Group>
          
            {selectedOrder.transport === "Yes" && (
              <Form.Group className="mt-3">
                <Form.Label>Transport Price</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedOrder.transportPrice}
                  onChange={(e) => handleChange(e, null, "transportPrice")}
                  onWheel={(e) => e.target.blur()}
                />
              </Form.Group>
            )}
          
            <Form.Group className="mt-3">
              <Form.Label>Payment Status</Form.Label>
              <Form.Select
                value={selectedOrder.paymentStatus}
                onChange={(e) => handleChange(e, null, "paymentStatus")}
              >
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Received</option>
              </Form.Select>
            </Form.Group>
          
            {selectedOrder.paymentStatus === "Partial" && (
              <Form.Group className="mt-3">
                <Form.Label>Amount Paid</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedOrder.amountPaid}
                  onChange={(e) => handleChange(e, null, "amountPaid")}
                  placeholder="Enter Amount Paid"
                  onWheel={(e) => e.target.blur()}
                />
              </Form.Group>
            )}
          
            {["Paid", "Partial"].includes(selectedOrder.paymentStatus) && (
              <>
                <Form.Group className="mt-3">
                  <Form.Label>Payment Type</Form.Label>
                  <Form.Select
                    value={selectedOrder.paymentType || ""}
                    onChange={(e) => handleChange(e, null, "paymentType")}
                  >
                    <option value="">Select Payment Type</option>
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                    <option value="Online">Online</option>
                  </Form.Select>
                </Form.Group>
          
                {selectedOrder.paymentType === "Check" && (
                  <>
                    <Form.Group className="mt-3">
                      <Form.Label>Bank Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedOrder.bankName || ""}
                        onChange={(e) => handleChange(e, null, "bankName")}
                        placeholder="Enter Bank Name"
                      />
                    </Form.Group>
          
                    <Form.Group className="mt-3">
                      <Form.Label>Cheque No.</Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedOrder.checkNo || ""}
                        onChange={(e) => handleChange(e, null, "checkNo")}
                        placeholder="Enter Check Number"
                      />
                    </Form.Group>
                  </>
                )}
          
                {selectedOrder.paymentType === "Online" && (
                  <Form.Group className="mt-3">
                    <Form.Label>Transaction ID</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedOrder.transactionId || ""}
                      onChange={(e) => handleChange(e, null, "transactionId")}
                      placeholder="Enter Transaction ID"
                    />
                  </Form.Group>
                )}

                {["Paid", "Partial"].includes(selectedOrder.paymentStatus) && (
                  <Form.Group className="mt-3">
                    <Form.Label>Payment Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={selectedOrder.paymentDate || ""}
                      onChange={(e) => handleChange(e, null, "paymentDate")}
                    />
                  </Form.Group>
                )}
              </>
            )}
          </Form>          
          )}
        </Modal.Body>
        <Modal.Footer className="bg-dark text-light">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bootstrap Modal for Canceling Invoice */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to cancel Invoice <strong>{orderToCancel?.invoiceNo}</strong> for <strong>{orderToCancel?.companyName}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            No, Keep Invoice
          </Button>
          <Button variant="danger" onClick={handleCancelOrder}>
            Yes, Cancel Invoice
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Orders;
