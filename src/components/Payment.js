// import React, { useState, useEffect } from "react";
// import { Modal, Button, Form } from "react-bootstrap";

// const Payment = () => {
//     const [companies, setCompanies] = useState([]);
//     const [selectedCompany, setSelectedCompany] = useState("");
//     const [orders, setOrders] = useState([]);

//     // TESTING
//     const [showModal, setShowModal] = useState(false);
//     const [companyList, setCompanyList] = useState([]);
//     const [selectedAddCompany, setSelectedAddCompany] = useState("");
//     const [customerName, setCustomerName] = useState("");
//     const [paymentDetail, setPaymentDetail] = useState({ paymentType: "", bankName: "", checkNo: "", transactionId: "", amountPaid: "" });

//     useEffect(() => {
//         const fetchCompanies = async () => {
//           const res = await fetch("http://localhost:5000/api/companies");
//           const data = await res.json();
//           setCompanyList(data); // keep entire data
//           setCompanies(data.map(c => c.company_name)); // for filtering list
//         };

//         const fetchOrders = async () => {
//         const res = await fetch("http://localhost:5000/api/orders");
//         const data = await res.json();
//         setOrders(data);
//         };

//         fetchCompanies();
//         fetchOrders();
//     }, []);

//     const filteredOrders = orders.filter(order => {
//       const isMatch = selectedCompany === "" || order.company_name === selectedCompany;
//       const isPendingOrPartial = order.payment_status === "Pending" || order.payment_status === "Partial";
//       const isNotCancelled = !order.cancelled;
//       return isMatch && isPendingOrPartial && isNotCancelled;
//     });

//     const resetModal = () => {
//       setShowModal(false);
//       setSelectedAddCompany("");
//       setCustomerName("");
//       setPaymentDetail({ paymentType: "", bankName: "", checkNo: "", transactionId: "", amountPaid: "" });
//     };

//   return (
//     <div className="container mt-4">
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h2 className="mt-3" style={{ color: "white", fontFamily: "DM Serif Text, serif", animation: "fadeSlideUp 1.5s ease-out" }}>Payment Details</h2>
//         <Button
//           className="btn btn-success me-2 glow-button glow-table"
//           onClick={() => setShowModal(true)}
//           style={{ animation: "fadeSlideUp 1.5s ease-out", backgroundColor: "transparent", color: "#fff", padding: "12px 24px", fontWeight: "600", fontSize: "16px", cursor: "pointer" }}
//         >
//           + Add Payment
//         </Button>
//       </div>

//       {/* Filter Section */}
//       <div className="d-flex gap-3 mb-4" style={{ animation: "fadeSlideUp 1.5s ease-out" }}>
//         <div>
//             <select className="form-select" value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}>
//                 <option value="">All Companies</option>
//                 {companies.map((company, idx) => (
//                     <option key={idx} value={company}>
//                     {company}
//                     </option>
//                 ))}
//             </select>
//         </div>
//       </div>

//       <div className="scroll-container glow-table" style={{ animation: "fadeSlideUp 1.5s ease-out", borderRadius: "14px", overflow: "auto", whiteSpace: "nowrap", scrollbarColor: "white transparent", maxHeight: "800px" }}>
//         <table className="table table-bordered table-striped" style={{ border: "1px solid grey" }}>
//           <thead className="table-secondary" style={{ border: "1px solid grey" }}>
//             <tr>
//               <th className="text-center">Sr No.</th>
//               <th className="text-center">Invoice No</th>
//               <th className="text-center">Sales Amount</th>
//               <th className="text-center">Payment Status</th>
//               <th className="text-center">Amount Paid</th>
//               <th className="text-center">Pending Amount</th>
//               <th className="text-center">Payment Type</th>
//               <th className="text-center">Payment Details</th>
//               <th className="text-center">Payment Date</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredOrders.length > 0 ? (
//               filteredOrders.map((order, index) => (
//                 <tr key={order.id}>
//                   <td className="table-dark text-center">{index + 1}</td>
//                   <td className="table-dark text-center">{order.invoice_no}</td>
//                   <td className="table-dark text-center">₹{order.sales_amount}</td>
//                   <td className="table-dark text-center">
//                     <span className={`badge ${
//                       order.payment_status === "Pending"
//                         ? "bg-danger"
//                         : order.payment_status === "Partial"
//                         ? "bg-warning"
//                         : "bg-success"
//                     }`}>
//                       {order.payment_status}
//                     </span>
//                   </td>
//                   <td className="table-dark text-center">
//                     {order.payment_status === "Partial" 
//                       ? <span className="text-warning fw-bold">₹{order.amount_paid}</span> 
//                       : <span className="text-danger fw-bold">-</span>}
//                   </td>
//                   <td className="table-dark text-center text-danger fw-bold">
//                     {order.payment_status === "Pending"
//                       ? `₹${order.sales_amount}`
//                       : order.payment_status === "Partial"
//                       ? `₹${order.sales_amount - order.amount_paid}`
//                       : "₹0"}
//                   </td>
//                   <td className="table-dark text-center">{order.payment_type || "-"}</td>
//                   <td className="table-dark text-center">
//                     {order.payment_type === "Check" ? (
//                       <>
//                         <div><strong>Bank:</strong> {order.bank_name}</div>
//                         <div><strong>Check No:</strong> {order.check_no}</div>
//                       </>
//                     ) : order.payment_type === "Online" ? (
//                       <div><strong>Txn ID:</strong> {order.transaction_id}</div>
//                     ) : (
//                       "-"
//                     )}
//                   </td>
//                   <td className="table-dark text-center">
//                     {order.payment_date
//                       ? new Date(order.payment_date).toISOString().split("T")[0]
//                       : "-"}
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td className="table-dark text-center text-light" colSpan="9">
//                   No Payment Details
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       <Modal show={showModal} onHide={resetModal} centered>
//         <Modal.Header closeButton className="bg-dark text-light">
//           <Modal.Title>Add Payment</Modal.Title>
//         </Modal.Header>

//         <Modal.Body className="bg-dark text-light">
//           <Form>
//             {/* Company Dropdown */}
//             <Form.Group>
//               <Form.Label>Company Name</Form.Label>
//                 <Form.Select
//                   className="form-control"
//                   value={selectedAddCompany}
//                   onChange={(e) => {
//                     const selected = e.target.value;
//                     setSelectedAddCompany(selected);
//                     const match = companyList.find(c => c.company_name === selected);
//                     setCustomerName(match ? match.customer_name : "");
//                   }}
//                 >
//                   <option value="">Select Company</option>
//                   {companyList.map((c, idx) => (
//                     <option key={idx} value={c.company_name}>{c.company_name}</option>
//                   ))}
//                 </Form.Select>
//             </Form.Group>

//             {/* Customer Name */}
//             <Form.Group className="mt-3">
//               <Form.Label>Customer Name</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={customerName}
//                   disabled
//                   placeholder="Customer Name"
//                 />
//             </Form.Group>

//             {/* Payment Details section */}
//             <>
//               <div className="mt-3 text-white">
//                 {/* Payment Type */}
//                 <Form.Group>
//                   <Form.Label>Payment Type</Form.Label>
//                   <Form.Select
//                     value={paymentDetail.paymentType}
//                     onChange={(e) =>
//                       setPaymentDetail({ ...paymentDetail, paymentType: e.target.value })
//                     }
//                   >
//                     <option value="">Select Type</option>
//                     <option value="Cash">Cash</option>
//                     <option value="Check">Check</option>
//                     <option value="Online">Online</option>
//                   </Form.Select>
//                 </Form.Group>

//                 {/* Amount Paid */}
//                 <Form.Group className="mt-3">
//                   <Form.Label>Amount Paid</Form.Label>
//                   <Form.Control
//                     type="number"
//                     min="0"
//                     placeholder="Enter Amount Paid"
//                     onWheel={(e) => e.target.blur()}
//                     value={paymentDetail.amountPaid || ""}
//                     onChange={(e) =>
//                       setPaymentDetail({ ...paymentDetail, amountPaid: e.target.value })
//                     }
//                   />
//                 </Form.Group>

//                 {/* Conditionally Show Bank/Check/Txn Fields */}
//                 {paymentDetail.paymentType === "Check" && (
//                   <>
//                     <Form.Group className="mt-3">
//                       <Form.Label>Bank Name</Form.Label>
//                       <Form.Control
//                         type="text"
//                         placeholder="Enter Bank Name"
//                         value={paymentDetail.bankName}
//                         onChange={(e) =>
//                           setPaymentDetail({ ...paymentDetail, bankName: e.target.value })
//                         }
//                       />
//                     </Form.Group>

//                     <Form.Group className="mt-3">
//                       <Form.Label>Cheque No.</Form.Label>
//                       <Form.Control
//                         type="text"
//                         placeholder="Enter Cheque No."
//                         value={paymentDetail.checkNo}
//                         onChange={(e) =>
//                           setPaymentDetail({ ...paymentDetail, checkNo: e.target.value })
//                         }
//                       />
//                     </Form.Group>
//                   </>
//                 )}

//                 {paymentDetail.paymentType === "Online" && (
//                   <Form.Group className="mt-3">
//                     <Form.Label>Transaction ID</Form.Label>
//                     <Form.Control
//                       type="text"
//                       placeholder="Enter Transaction ID"
//                       value={paymentDetail.transactionId}
//                       onChange={(e) =>
//                         setPaymentDetail({ ...paymentDetail, transactionId: e.target.value })
//                       }
//                     />
//                   </Form.Group>
//                 )}
//               </div>
//             </>
//           </Form>
//         </Modal.Body>

//         <Modal.Footer className="bg-dark text-light">
//           <Button variant="secondary" onClick={resetModal}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={() => console.log("Save logic here")}>
//             Save Payment
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default Payment;

import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Payment = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [companyList, setCompanyList] = useState([]);
  const [selectedAddCompany, setSelectedAddCompany] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentDetail, setPaymentDetail] = useState({
    paymentType: "",
    bankName: "",
    checkNo: "",
    transactionId: "",
    amountPaid: "",
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      const res = await fetch("http://localhost:5000/api/companies");
      const data = await res.json();
      setCompanyList(data);
      setCompanies(data.map((c) => c.company_name));
    };

    const fetchOrders = async () => {
      const res = await fetch("http://localhost:5000/api/orders");
      const data = await res.json();
      setOrders(data);
    };

    fetchCompanies();
    fetchOrders();
  }, []);

  const resetModal = () => {
    setShowModal(false);
    setSelectedAddCompany("");
    setCustomerName("");
    setPaymentDetail({
      paymentType: "",
      bankName: "",
      checkNo: "",
      transactionId: "",
      amountPaid: "",
    });
  };

  const filteredOrders = orders.filter((order) => {
    const isMatch = selectedCompany === "" || order.company_name === selectedCompany;
    const isPendingOrPartial = order.payment_status === "Pending" || order.payment_status === "Partial";
    const isNotCancelled = !order.cancelled;
    return isMatch && isPendingOrPartial && isNotCancelled;
  });

  return (
    <div className="container mt-4">
      <ToastContainer />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mt-3 text-white">Payment Details</h2>
        <Button className="btn btn-success me-2 glow-button glow-table" onClick={() => setShowModal(true)} style={{ animation: "fadeSlideUp 1.5s ease-out", backgroundColor: "transparent", color: "#fff", padding: "12px 24px", fontWeight: "600", fontSize: "16px", cursor: "pointer" }}>
          + Add Payment
        </Button>
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
            {companies.map((company, idx) => (
              <option key={idx} value={company}>
                {company}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="scroll-container" style={{ maxHeight: "800px", overflow: "auto" }}>
        <table className="table table-bordered table-striped">
          <thead className="table-secondary">
            <tr>
              <th className="text-center">Sr No.</th>
              <th className="text-center">Invoice No</th>
              <th className="text-center">Sales Amount</th>
              <th className="text-center">Payment Status</th>
              <th className="text-center">Amount Paid</th>
              <th className="text-center">Pending Amount</th>
              <th className="text-center">Payment Type</th>
              <th className="text-center">Payment Details</th>
              <th className="text-center">Payment Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => {
                const pendingAmt = order.sales_amount - (order.amount_paid || 0);
                return (
                  <tr key={order.id}>
                    <td className="table-dark text-center">{index + 1}</td>
                    <td className="table-dark text-center">{order.invoice_no}</td>
                    <td className="table-dark text-center">₹{order.sales_amount}</td>
                    <td className="table-dark text-center">
                      <span className={`badge ${
                        order.payment_status === "Pending"
                          ? "bg-danger"
                          : order.payment_status === "Partial"
                          ? "bg-warning"
                          : "bg-success"
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="table-dark text-center">
                      {order.payment_status !== "Pending"
                        ? <span className="text-warning fw-bold">₹{order.amount_paid}</span>
                        : <span className="text-danger fw-bold">-</span>}
                    </td>
                    <td className="table-dark text-center">
                      {order.payment_status !== "Paid" ? <span className="text-danger fw-bold">₹{pendingAmt}</span> : <span className="text-danger fw-bold">-</span>}
                    </td>
                    <td className="table-dark text-center">{order.payment_type || "-"}</td>
                    <td className="table-dark text-center">
                      {order.payment_type === "Check" ? (
                        <>
                          <div><strong>Bank:</strong> {order.bank_name}</div>
                          <div><strong>Check No:</strong> {order.check_no}</div>
                        </>
                      ) : order.payment_type === "Online" ? (
                        <div><strong>Txn ID:</strong> {order.transaction_id}</div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="table-dark text-center">
                      {order.payment_date
                        ? new Date(order.payment_date).toISOString().split("T")[0]
                        : "-"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="table-dark text-center text-light" colSpan="9">
                  No Payment Details
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={resetModal} centered>
        <Modal.Header closeButton className="bg-dark text-light">
          <Modal.Title>Add Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          <Form>
            <Form.Group>
              <Form.Label>Company Name</Form.Label>
              <Form.Select
                value={selectedAddCompany}
                onChange={(e) => {
                  const selected = e.target.value;
                  setSelectedAddCompany(selected);
                  const match = companyList.find(c => c.company_name === selected);
                  setCustomerName(match ? match.customer_name : "");
                }}
              >
                <option value="">Select Company</option>
                {companyList.map((c, idx) => (
                  <option key={idx} value={c.company_name}>{c.company_name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Customer Name</Form.Label>
              <Form.Control type="text" value={customerName} disabled placeholder="Customer Name" />
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Payment Type</Form.Label>
              <Form.Select
                value={paymentDetail.paymentType}
                onChange={(e) =>
                  setPaymentDetail({ ...paymentDetail, paymentType: e.target.value })
                }
              >
                <option value="">Select Type</option>
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
                <option value="Online">Online</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Amount Paid</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter Amount Paid"
                value={paymentDetail.amountPaid}
                onChange={(e) =>
                  setPaymentDetail({ ...paymentDetail, amountPaid: e.target.value })
                }
              />
            </Form.Group>

            {paymentDetail.paymentType === "Check" && (
              <>
                <Form.Group className="mt-3">
                  <Form.Label>Bank Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Bank Name"
                    value={paymentDetail.bankName}
                    onChange={(e) =>
                      setPaymentDetail({ ...paymentDetail, bankName: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mt-3">
                  <Form.Label>Check No.</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Check No."
                    value={paymentDetail.checkNo}
                    onChange={(e) =>
                      setPaymentDetail({ ...paymentDetail, checkNo: e.target.value })
                    }
                  />
                </Form.Group>
              </>
            )}

            {paymentDetail.paymentType === "Online" && (
              <Form.Group className="mt-3">
                <Form.Label>Transaction ID</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Transaction ID"
                  value={paymentDetail.transactionId}
                  onChange={(e) =>
                    setPaymentDetail({ ...paymentDetail, transactionId: e.target.value })
                  }
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>

        <Modal.Footer className="bg-dark text-light">
          <Button variant="secondary" onClick={resetModal}>Cancel</Button>
          <Button
            variant="success"
            onClick={async () => {
              let paidAmount = Number(paymentDetail.amountPaid);
              if (!selectedAddCompany || !paidAmount || paidAmount <= 0) {
                toast.error("Please select company and enter valid amount");
                return;
              }

              const companyOrders = orders.filter(
                (order) =>
                  order.company_name === selectedAddCompany &&
                  (order.payment_status === "Pending" || order.payment_status === "Partial") &&
                  !order.cancelled
              );

              const updatedOrders = [];

              for (const order of companyOrders) {
                let currentPaid = Number(order.amount_paid) || 0;
                const total = Number(order.sales_amount);
                const pending = total - currentPaid;

                if (paidAmount <= 0) break;

                if (pending <= paidAmount) {
                  currentPaid += pending;
                  paidAmount -= pending;
                  updatedOrders.push({ ...order, payment_status: "Paid", amount_paid: currentPaid });
                } else {
                  currentPaid += paidAmount;
                  updatedOrders.push({ ...order, payment_status: "Partial", amount_paid: currentPaid });
                  paidAmount = 0;
                }
              }

              for (const updated of updatedOrders) {
                try {
                  await fetch(`http://localhost:5000/api/orders/${updated.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      invoice_date: updated.invoice_date,
                      payment_status: updated.payment_status,
                      amount_paid: updated.amount_paid,
                      payment_type: paymentDetail.paymentType,
                      bank_name: paymentDetail.bankName,
                      check_no: paymentDetail.checkNo,
                      transaction_id: paymentDetail.transactionId,
                      transport: updated.transport,
                      transport_price: updated.transport_price,
                      final_total: updated.final_total,
                      grand_total: updated.grand_total,
                      sales_amount: updated.sales_amount,
                      gst: updated.gst,
                      cgst: updated.cgst,
                      sgst: updated.sgst,
                      igst: updated.igst,
                      invoice_month: updated.invoice_month,
                      products: updated.products || [],
                      payment_date: new Date().toISOString().split("T")[0],
                    }),
                  });
                } catch (err) {
                  console.error("Update failed:", err);
                }
              }

              // Save payment in payment_entries table
              await fetch("http://localhost:5000/api/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  companyName: selectedAddCompany,
                  paymentType: paymentDetail.paymentType,
                  amountPaid: Number(paymentDetail.amountPaid),
                  bankName: paymentDetail.bankName || null,
                  checkNo: paymentDetail.checkNo || null,
                  transactionId: paymentDetail.transactionId || null,
                }),
              });

              toast.success("Payment saved successfully!");

              const refreshed = await fetch("http://localhost:5000/api/orders");
              const freshData = await refreshed.json();
              setOrders(freshData);
              resetModal();
            }}
          >
            Save Payment
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Payment;
