import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import "../styles/Orders.css";

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
    const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    const updatedOrders = savedOrders.map(order => ({
      ...order,
      cancelled: order.cancelled || false, // default to false
    }));
    setOrders(updatedOrders);
  }, []);  

  // Function to handle redirection
  const handleViewOrder = (order) => {
    navigate("/invoice/view-invoice", { state: { order } });  // Pass order details if needed
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
  const handleSave = () => {
    const updatedOrders = orders.map((order) =>
      order.invoiceNo === selectedOrder.invoiceNo ? selectedOrder : order
    );

    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    setShowModal(false);
  };

  const calculateTotals = (order) => {
    const finalTotal = order.products.reduce((sum, p) => {
      const qty = parseFloat(p.quantity) || 0;
      const price = parseFloat(p.price) || 0;
      return sum + qty * price;
    }, 0);
  
    const transportPrice = order.transport === "Yes" && order.transportPrice
      ? parseFloat(order.transportPrice) || 0
      : 0;
  
    const grandTotal = finalTotal + transportPrice;
  
    const gstRate = order.gst ? parseFloat(order.gst.replace("%", "")) / 100 : 0;
    const isGujarat = order.stateCode === "24";
  
    const cgst = isGujarat ? (grandTotal * gstRate) / 2 : 0;
    const sgst = isGujarat ? (grandTotal * gstRate) / 2 : 0;
    const igst = !isGujarat ? grandTotal * gstRate : 0;
  
    const salesAmount = grandTotal + cgst + sgst + igst;
  
    return {
      finalTotal: finalTotal.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      igst: igst.toFixed(2),
      salesAmount: salesAmount.toFixed(2),
    };
  }; 

  return (
    <div className="container mt-4">
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
            {[...new Set(orders.map(order => order.companyName))].map((name, idx) => (
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

      {/* Make the table horizontally scrollable */}
      <div className="scroll-container glow-table" style={{ animation: "fadeSlideUp 1.5s ease-out", borderRadius: "12px", overflowX: "auto", whiteSpace: "nowrap", scrollbarColor: "white transparent" }}>
        <table className="table table-bordered table-striped" style={{ border: "1px solid grey" }}>
          <thead className="table-dark">
            <tr>
              <th className="text-center">Sr No.</th>
              <th className="text-center">Invoice No.</th>
              <th className="text-center">Invoice Date</th>
              <th className="text-center">Invoice Month</th>
              <th className="text-center">Company Name</th>
              <th className="text-center">Product Details</th>
              <th className="text-center">Quantity</th>
              <th className="text-center">Unit</th>
              <th className="text-center">Price</th>
              <th className="text-center">GST</th>
              <th className="text-center">CGST</th>
              <th className="text-center">SGST</th>
              <th className="text-center">IGST</th>
              <th className="text-center">Transport</th>
              <th className="text-center">Final Amount</th>
              <th className="text-center">Job Work / Supplier</th>
              <th className="text-center">Payment Status</th>
              <th className="text-center">Amount Paid</th>
              <th className="text-center">Pending Amount</th>
              <th className="text-center">Payment Type</th>
              <th className="text-center">Payment Details</th>
              <th className="text-center">Edit Invoice</th>
              <th className="text-center">Cancel Invoice</th>
              <th className="text-center">Create Invoice</th>
              <th className="text-center">Create Chalan</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders
              .filter(order => {
                const matchesCompany = selectedCompany === "" || order.companyName === selectedCompany;
                const matchesStatus = selectedPaymentStatus === "" || order.paymentStatus === selectedPaymentStatus;
                return matchesCompany && matchesStatus;
              })
              .map((order, index) => {
                return (
                  <tr key={index} style={order.cancelled ? { opacity: 0.5, textDecoration: "line-through", textDecorationColor: "#FF073A" } : {}}>
                    <td className="table-dark text-center">{index + 1}</td>
                    <td className="table-dark text-center">{order.invoiceNo}</td> {/* Display Invoice Number */}
                    <td className="table-dark text-center">{order.invoiceDate}</td> {/* Display Invoice Date */}
                    <td className="table-dark text-center">{order.invoiceMonth}</td>
                    <td className="table-dark text-center">
                      {order.cancelled ? (
                        <span
                          style={{ color: "lightgrey", cursor: "not-allowed" }}
                          title="This invoice is cancelled"
                        >
                          {order.companyName}
                        </span>
                      ) : (
                        <span 
                          onClick={() => handleViewOrder(order)}
                          style={{ cursor: "pointer", color: "white", textDecoration: "none" }}
                          onMouseOver={(e) => e.target.style.color = "red"}
                          onMouseOut={(e) => e.target.style.color = "white"}
                          title="Click to view Invoice Details"
                        >
                          {order.companyName}
                        </span>
                      )}
                    </td>

                    <td className="table-dark text-center">
                      {order.products.map((product, i) => (
                        <div 
                          key={i} 
                          style={{ 
                            maxWidth: "150px",
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

                    <td className="table-dark text-center">{order.gst}</td>
                    <td className="table-dark text-center">₹{order.cgst}</td>
                    <td className="table-dark text-center">₹{order.sgst}</td>
                    <td className="table-dark text-center">₹{order.igst}</td>
                    <td className="table-dark text-center">{order.transport === "Yes" ? `₹${order.transportPrice}` : "N/A"}</td>
                    <td className="table-dark text-center">₹{order.salesAmount}</td>
                    <td className="table-dark text-center">{order.jobWorkSupplier !== "" ? `${order.jobWorkSupplier}` : "N/A"}</td>
                    <td className="table-dark text-center">
                      <span className={`badge ${order.paymentStatus === "Paid" ? "bg-success" : order.paymentStatus === "Partial" ? "bg-warning" : "bg-danger"}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="table-dark text-center">
                      {order.paymentStatus === "Partial" ? (
                        <span className="text-warning fw-bold">₹{order.amountPaid}</span>
                      ) : order.paymentStatus === "Paid" ? (
                        <span className="fw-bold" style={{ color: "lightgreen" }}>₹{order.salesAmount}</span>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="table-dark text-center">
                      {order.paymentStatus === "Partial" ? (
                        <span className="text-danger fw-bold">₹{order.salesAmount - order.amountPaid}</span>
                      ) : order.paymentStatus === "Pending" ? (
                        <span className="text-danger fw-bold">₹{order.salesAmount}</span>
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
                          <div><strong>Cheque No:</strong> {order.checkNo}</div>
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
                          const savedCompanies = JSON.parse(localStorage.getItem("companies")) || [];
                          const companyDetails = savedCompanies.find(comp => comp.companyName === order.companyName);
                          navigate("/create-bill", { state: { order, company: companyDetails } });
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
                          const savedCompanies = JSON.parse(localStorage.getItem("companies")) || [];
                          const companyDetails = savedCompanies.find(comp => comp.companyName === order.companyName);
                          navigate("/create-chalan", { state: { order, company: companyDetails } });
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
                <td colSpan="25" className="text-center bg-dark text-light">No Invoice added yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Bootstrap Modal for Editing Invoice */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-dark text-light">
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
          
            {selectedOrder.products.map((product, index) => (
              <div className="mt-3" key={index}>
                <Form.Group>
                  <Form.Label>Product Details - {index + 1}</Form.Label>
                  <Form.Control
                    type="text"
                    value={product.productDetails}
                    onChange={(e) => handleChange(e, index, "productDetails")}
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
                <hr />
              </div>
            ))}
          
            <Form.Group>
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
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
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
                    <option value="Check">Cheque</option>
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
                        placeholder="Enter Cheque Number"
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
          <Button
            variant="danger"
            onClick={() => {
              const updatedOrders = orders.map(order =>
                order.invoiceNo === orderToCancel.invoiceNo
                  ? { ...order, cancelled: true }
                  : order
              );
              setOrders(updatedOrders);
              localStorage.setItem("orders", JSON.stringify(updatedOrders));
              setShowCancelModal(false);
            }}
          >
            Yes, Cancel Invoice
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Orders;
