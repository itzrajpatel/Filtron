import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AddOrder.css";

const AddPurchase = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    companyName: "",
    transporter: "",
    transportCharge: 0,
    lrNo: "",
    invoiceNo: "",
    invoiceMonth: "",
    invoiceDate: "",
    discount: 0,
    gst: "",
    cgst: 0,
    sgst: 0,
    igst: 0,
    transport: "Paid",
    freight: 0,
    finalTotal: 0,
    grandTotal: 0,
    salesAmount: 0,
    tcs: 0,
    grossAmount: 0,
    paymentStatus: "Pending",
    amountPaid: "",
    paymentType: "",
    bankName: "",
    checkNo: "",
    transactionId: "",
    dateOfPayment: "",
    productCode: ""
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      const res = await fetch("http://localhost:5000/api/companies");
      const data = await res.json();
      const formatted = data.map(c => ({
        companyName: c.company_name,
        state: c.state,
        stateCode: c.state_code
      }));
      setCompanies(formatted);
    };
    fetchCompanies();
  }, []);    

  const [products, setProducts] = useState([
    { productName: "", productCode: "", hsnNo: "", productDescription: "", quantity: "", price: "", total: 0, unit: "PCS" }
  ]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === "companyName") {
        const selectedCompany = companies.find(comp => comp.companyName === value);
        updated.state = selectedCompany ? selectedCompany.state : "";
        updated.stateCode = selectedCompany ? selectedCompany.stateCode : "";
      }
      if (name === "gst") handleGSTChange(value, updated);
      calculateTotals(updated);
      return updated;
    });
  };

  const handleGSTChange = (value, updatedData = formData) => {
    const gstRate = parseFloat(value.replace("%", "")) / 100;
    const grand = parseFloat(updatedData.grandTotal) || 0;
    let cgst = 0, sgst = 0, igst = 0;
    if (updatedData.stateCode === "24") {
      cgst = (grand * gstRate) / 2;
      sgst = (grand * gstRate) / 2;
    } else {
      igst = grand * gstRate;
    }
    setFormData(prev => ({
      ...prev,
      gst: value,
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      igst: igst.toFixed(2)
    }));
  };

  const handleProductChange = (index, e) => {
    const { name, value } = e.target;
    const updatedProducts = [...products];
    updatedProducts[index][name] = value;
    if (["quantity", "price"].includes(name)) {
      const qty = parseFloat(updatedProducts[index].quantity) || 0;
      const price = parseFloat(updatedProducts[index].price) || 0;
      updatedProducts[index].total = (qty * price).toFixed(2);
    }
    setProducts(updatedProducts);
    setTimeout(() => calculateTotals(), 0);
  };

  const calculateTotals = useCallback((customForm = formData) => {
    const finalTotal = products.reduce((sum, p) => sum + parseFloat(p.total || 0), 0);
    // const grandTotal = finalTotal - parseFloat(customForm.discount || 0);
    const grandTotal = finalTotal - parseFloat(customForm.discount || 0) + parseFloat(customForm.transportCharge || 0);
    const transportCharge = parseFloat(customForm.freight || 0);
    const gstRate = customForm.gst ? parseFloat(customForm.gst) / 100 : 0;
    const isGujarat = customForm.stateCode === "24";
    const cgst = isGujarat ? (grandTotal * gstRate) / 2 : 0;
    const sgst = isGujarat ? (grandTotal * gstRate) / 2 : 0;
    const igst = !isGujarat ? grandTotal * gstRate : 0;
    const tcs = parseFloat(customForm.tcs || 0);
    const salesAmount = grandTotal + cgst + sgst + igst + tcs;
    const grossAmount = salesAmount + transportCharge;

    setFormData(prev => ({
      ...prev,
      finalTotal: finalTotal.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      igst: igst.toFixed(2),
      salesAmount: salesAmount.toFixed(2),
      grossAmount: grossAmount.toFixed(2)
    }));
  }, [products]);  

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);    

  const addProduct = () => {
    setProducts([...products, { productName: "", productCode: "", hsnNo: "", productDescription: "", quantity: "", price: "", total: 0, unit: "" }]);
  };

  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const today = new Date();
    const invoiceDate = formData.invoiceDate || today.toISOString().split("T")[0];
    const invoiceMonth = formData.invoiceMonth || today.toLocaleString("default", { month: "long" });
  
    const newPurchase = {
      id: Date.now(), // Not used in PostgreSQL but retained for compatibility
      createdAt: today.toISOString().split("T")[0],
      invoiceNo: formData.invoiceNo,
      invoiceMonth,
      invoiceDate,
      ...formData,
      products
    };
  
    try {
      const response = await fetch("http://localhost:5000/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPurchase)
      });
  
      if (response.ok) {
        alert("Purchase saved successfully!");
        navigate("/purchase");
      } else {
        alert("Failed to save purchase");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Server error occurred");
    }
  };    

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4 text-white" style={{ fontFamily: "Tinos, serif", animation: "fadeSlideUp 1.5s ease-out" }}>Add Purchase Details</h2>
      <form onSubmit={handleSubmit} className="p-4 rounded text-light glow-table" style={{ animation: "fadeSlideUp 1.5s ease-out" }}>
        <div className="row mb-3">
          {/* Company Name */}
          <div className="col-md-4">
              <label className="form-label">Company Name</label>
              <select className="form-select" name="companyName" value={formData.companyName} onChange={handleChange} required>
                <option value="">Select a Company</option>
                {companies.map((comp, index) => (
                  <option key={index} value={comp.companyName}>{comp.companyName}</option>
                ))}
              </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Location</label>
            <input type="text" name="location" className="form-control" value={formData.state} readOnly />
          </div>

          <div className="col-md-4">
            <label className="form-label">State Code</label>
            <input type="number" name="stateCode" className="form-control" value={formData.stateCode} readOnly />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Type of Purchase</label>
            <input type="text" name="typeOfPurchase" className="form-control" value={formData.typeOfPurchase} onChange={handleChange} required />
          </div>

          <div className="col-md-4">
            <label className="form-label">Item Code</label>
            <input type="text" name="productCode" className="form-control" value={formData.productCode} onChange={handleChange} required />
          </div>

          <div className="col-md-4">
            <label className="form-label">Item Name</label>
            <input type="text" name="productName" className="form-control" value={formData.productName} onChange={handleChange} required />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Invoice No</label>
            <input type="text" name="invoiceNo" className="form-control" value={formData.invoiceNo} onChange={handleChange} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Invoice Month</label>
            <select name="invoiceMonth" className="form-control" value={formData.invoiceMonth} onChange={handleChange} required>
              <option value="">Select Month</option>
              {months.map(m => (<option key={m} value={m}>{m}</option>))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Invoice Date</label>
            <input type="date" name="invoiceDate" className="form-control" value={formData.invoiceDate} onChange={handleChange} required />
          </div>
        </div>

        <label className="form-label">Item Details</label>
        {products.map((product, index) => (
          <div className="row mb-3" key={index}>
            <div className="col-md-3">
              <input type="text" name="productDescription" className="form-control" placeholder="Description" value={product.productDescription} onChange={(e) => handleProductChange(index, e)} required />
            </div>
            <div className="col-md-2">
              <input type="text" name="hsnNo" className="form-control" placeholder="HSN No." value={product.hsnNo} onChange={(e) => handleProductChange(index, e)} required />
            </div>
            <div className="col-md-1">
              <input type="number" name="quantity" className="form-control" placeholder="Qty" value={product.quantity} onChange={(e) => handleProductChange(index, e)} onWheel={(e) => e.target.blur()} required />
            </div>
            <div className="col-md-1">
              <select name="unit" className="form-control" value={product.unit} onChange={(e) => handleProductChange(index, e)} required>
                <option value="PCS">PCS</option>
                <option value="MTR">MTR</option>
              </select>
            </div>
            <div className="col-md-2">
              <input type="number" name="price" className="form-control" placeholder="Price" value={product.price} onChange={(e) => handleProductChange(index, e)} onWheel={(e) => e.target.blur()} required />
            </div>
            <div className="col-md-2">
              <input type="text" name="total" className="form-control" value={product.total} readOnly />
            </div>
            <div className="col-md-1">
              <button type="button" className="btn btn-danger" onClick={() => removeProduct(index)} disabled={products.length === 1}>–</button>
            </div>
          </div>
        ))}
        <button className="btn btn-primary glow-button glow-table mb-3" onClick={addProduct} style={{ background: "transparent", color: "#fff" }}>
          + Add Product
        </button>
        <div className="mb-4">Final Total: ₹{formData.finalTotal}</div>

        {/* Transport, LR No, Freight */}
        <div className="row">
          <div className="col-md-2 mb-3">
            <label className="form-label">Discount</label>
            <input type="number" name="discount" className="form-control" value={formData.discount} onChange={handleChange} onWheel={(e) => e.target.blur()} />
          </div>
          <div className="col-md-2 mb-3">
            <label className="form-label">Transport</label>
            <select name="transport" className="form-control" value={formData.transport} onChange={handleChange}>
              <option value="Paid">Paid</option>
              <option value="To Pay">To Pay</option>
            </select>
          </div>
          <div className="col-md-2 mb-3">
            <label className="form-label">LR No.</label>
            <input type="text" name="lrNo" className="form-control" value={formData.lrNo} onChange={handleChange} />
          </div>
          <div className="col-md-2 mb-3">
            <label className="form-label">Transporter</label>
            <input type="text" name="transporter" className="form-control" value={formData.transporter} onChange={handleChange} />
          </div>
          <div className="col-md-2 mb-3">
            <label className="form-label">Transport Charge</label>
            <input
              type="number"
              name="transportCharge"
              className="form-control"
              value={formData.transportCharge}
              onChange={handleChange}
              onWheel={(e) => e.target.blur()}
            />
          </div>
        </div>
        <div className="mb-4">Grand Total: ₹{formData.grandTotal}</div>

        {/* Rest GST, TCS, Payment Fields */}
        <div className="mb-3">
          <label className="form-label">GST</label>
          <select name="gst" className="form-control" value={formData.gst} onChange={handleChange}>
            <option value="">Select GST</option>
            <option value="5%">5%</option>
            <option value="12%">12%</option>
            <option value="18%">18%</option>
            <option value="24%">24%</option>
          </select>
        </div>

        {formData.gst && (
          <>
            <div className="mb-2">CGST: ₹{formData.cgst}</div>
            <div className="mb-2">SGST: ₹{formData.sgst}</div>
            <div className="mb-2">IGST: ₹{formData.igst}</div>
          </>
        )}

        <div className="mb-3">
          <label className="form-label">TCS</label>
          <input type="number" name="tcs" className="form-control" value={formData.tcs} onChange={handleChange} onWheel={(e) => e.target.blur()} />
        </div>

        <div className="mb-4">Sales Amount: ₹{formData.salesAmount}</div>

        <div className="mb-3">
          <label className="form-label">Freight</label>
          <input type="number" name="freight" className="form-control" value={formData.freight} onChange={handleChange} onWheel={(e) => e.target.blur()} />
        </div>
        <div className="mb-4">Gross Amount: ₹{formData.grossAmount}</div>

        <div className="mb-3">
          <label className="form-label">Payment Status</label>
          <select name="paymentStatus" className="form-control" value={formData.paymentStatus} onChange={handleChange}>
            <option value="Pending">Pending</option>
            <option value="Partial">Partial</option>
            <option value="Paid">Paid</option>
          </select>
        </div>

        {formData.paymentStatus === "Partial" && (
          <div className="mb-3">
            <label className="form-label">Amount Paid</label>
            <input type="number" name="amountPaid" className="form-control" value={formData.amountPaid} onChange={handleChange} onWheel={(e) => e.target.blur()} />
          </div>
        )}

        {['Paid', 'Partial'].includes(formData.paymentStatus) && (
          <>
            <div className="mb-3">
              <label className="form-label">Payment Type</label>
              <select name="paymentType" className="form-control" value={formData.paymentType} onChange={handleChange}>
                <option value="">Select Type</option>
                <option value="Cash">Cash</option>
                <option value="Check">Cheque</option>
                <option value="Online">Online</option>
              </select>
            </div>

            {formData.paymentType === "Check" && (
              <>
                <div className="mb-3">
                  <label className="form-label">Bank Name</label>
                  <input type="text" name="bankName" className="form-control" value={formData.bankName} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Cheque No</label>
                  <input type="text" name="checkNo" className="form-control" value={formData.checkNo} onChange={handleChange} />
                </div>
              </>
            )}

            {formData.paymentType === "Online" && (
              <div className="mb-3">
                <label className="form-label">Transaction ID</label>
                <input type="text" name="transactionId" className="form-control" value={formData.transactionId} onChange={handleChange} />
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Date of Payment</label>
              <input type="date" name="dateOfPayment" className="form-control" value={formData.dateOfPayment} onChange={handleChange} />
            </div>
          </>
        )}

        {/* <button type="submit" className="btn btn-dark w-100">Submit Purchase</button> */}
        <button type="submit" className="btn text-white bg-dark w-100 glow-table glow-button">Submit Purchase</button>
      </form>
    </div>
  );
};

export default AddPurchase;
