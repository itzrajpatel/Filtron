import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AddOrder.css";

const AddOrder = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    customerName: "",
    transport: "No",
    transportPrice: "",
    finalTotal: 0,
    grandTotal: 0,
    salesAmount: 0,
    gst: "",
    cgst: 0,
    sgst: 0,
    igst: 0,
    jobWorkSupplier: "",
    paymentStatus: "Pending",
    amountPaid: "",
  });

  const [products, setProducts] = useState([
    { productDetails: "", quantity: "", unit: "PCS", price: "", total: 0 }
  ]);

  const [companies, setCompanies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCompanies = JSON.parse(localStorage.getItem("companies")) || [];
    setCompanies(savedCompanies);
  }, []);

  // Handle changes in form inputs
  // const handleChange = (e) => {
  //   const { name, value } = e.target;

  //   setFormData((prevData) => {
  //       let updatedData = { ...prevData, [name]: value };

  //       if (name === "companyName") {
  //           const selectedCompany = companies.find(comp => comp.companyName === value);
  //           updatedData.customerName = selectedCompany ? selectedCompany.customerName : "";
  //           updatedData.stateCode = selectedCompany ? selectedCompany.stateCode : "";
  //       } 
  //       else if (name === "transport") {
  //           updatedData.transportPrice = value === "Yes" ? prevData.transportPrice || "" : ""; // ✅ Keep previous value or empty
  //       } 
  //       else if (name === "transportPrice") {
  //           updatedData.transportPrice = value; // ✅ Let user enter any value
  //       } 
  //       else if (name === "paymentStatus") {
  //           updatedData.amountPaid = value === "Partial" ? prevData.amountPaid : "";
  //       }

  //       return updatedData;
  //   });

  //   // Use a small delay to ensure the state updates first
  //   setTimeout(() => calculateTotals(), 0);
  // };
  const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prevData) => {
    let updatedData = { ...prevData, [name]: value };

    if (name === "companyName") {
      const selectedCompany = companies.find(comp => comp.companyName === value);
      updatedData.customerName = selectedCompany ? selectedCompany.customerName : "";
      updatedData.stateCode = selectedCompany ? selectedCompany.stateCode : "";
    } 
    else if (name === "transport") {
      updatedData.transportPrice = value === "Yes" ? prevData.transportPrice || "" : "";
    } 
    else if (name === "transportPrice") {
      updatedData.transportPrice = value;
    } 
    else if (name === "paymentStatus") {
      updatedData.amountPaid = value === "Partial" ? prevData.amountPaid : "";
    }

    // ✅ Pass updated data to calculateTotals
    calculateTotals(updatedData);

    return updatedData;
  });
};       

  // Handle changes in product fields
  const handleProductChange = (index, e) => {
    const { name, value } = e.target;
    const updatedProducts = [...products];
  
    updatedProducts[index][name] = value;
  
    if (["quantity", "price"].includes(name)) {
      const quantity = parseFloat(updatedProducts[index].quantity) || 0;
      const price = parseFloat(updatedProducts[index].price) || 0;
      updatedProducts[index].total = (quantity * price).toFixed(2);
    }
  
    setProducts(updatedProducts);
  
    // Ensure the totals update properly
    setTimeout(() => calculateTotals(), 0);
  };

  // Handle GST selection & update CGST, SGST, IGST
  const handleGSTChange = (e) => {
    const gstRate = parseFloat(e.target.value.replace("%", "")) / 100;
    const grandTotal = parseFloat(formData.grandTotal) || 0;
    let cgst = 0, sgst = 0, igst = 0;
  
    if (formData.stateCode === "24") {
      // Apply CGST + SGST (each 50% of GST) if state code is 24
      cgst = (grandTotal * gstRate / 2).toFixed(2);
      sgst = (grandTotal * gstRate / 2).toFixed(2);
      igst = 0;
    } else {
      // Apply IGST (100% of GST) if state code is not 24
      cgst = 0;
      sgst = 0;
      igst = (grandTotal * gstRate).toFixed(2);
    }
  
    // First update GST values, then trigger calculation
    setFormData((prev) => {
      const updatedFormData = {
        ...prev,
        gst: e.target.value,
        cgst,
        sgst,
        igst
      };
  
      // Now calculate totals after GST update
      calculateTotals(updatedFormData);
  
      return updatedFormData;
    });
  };        

  // Add new product row
  const addProduct = () => {
    setProducts([...products, { productDetails: "", quantity: "", unit: "PCS", price: "", total: 0 }]);
  };

  // Calculate Final Total, Grand Total, and Sales Amount
  const calculateTotals = useCallback(() => {
    const finalTotal = products.reduce((sum, p) => sum + parseFloat(p.total || 0), 0);
    const transportPrice = formData.transport === "Yes" && formData.transportPrice !== "" 
        ? parseFloat(formData.transportPrice) || 0 
        : 0; 
    const grandTotal = finalTotal + transportPrice;
  
    const gstRate = formData.gst ? parseFloat(formData.gst) / 100 : 0;
    const isGujarat = formData.stateCode === "24";
  
    const cgst = isGujarat ? (grandTotal * gstRate) / 2 : 0;
    const sgst = isGujarat ? (grandTotal * gstRate) / 2 : 0;
    const igst = !isGujarat ? grandTotal * gstRate : 0;
  
    const salesAmount = grandTotal + cgst + sgst + igst;
  
    setFormData((prev) => ({
        ...prev,
        finalTotal: finalTotal.toFixed(2),
        grandTotal: grandTotal.toFixed(2),
        cgst: cgst.toFixed(2),
        sgst: sgst.toFixed(2),
        igst: igst.toFixed(2),
        salesAmount: salesAmount.toFixed(2),
    }));
  }, [products, formData.transport, formData.transportPrice, formData.gst, formData.stateCode]);  

useEffect(() => {
    calculateTotals();
}, [calculateTotals]); // ✅ Now includes calculateTotals
  
  // Handle form submission
  const handleSubmit = (e) => {
  e.preventDefault();

  // Ensure required fields are not empty
  if (!formData.companyName || !products.length) {
      alert("Please enter a company name and at least one product.");
      return;
  }

  // Assign current date if not present
  const orderDate = formData.date || new Date().toISOString().split("T")[0];

  // Fetch existing orders from localStorage
  const existingOrders = JSON.parse(localStorage.getItem("orders")) || [];
  
  // Generate Invoice Number
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const formattedIndex = String(existingOrders.length + 1).padStart(3, "0"); // Ensure 3-digit format
  const newInvoiceNo = `DTI/${String(currentYear).slice(-2)}-${String(nextYear).slice(-2)}/${formattedIndex}`;

  // Generate Invoice Date & Invoice Month
  const today = new Date();
  const invoiceDate = `${today.getDate().toString().padStart(2, "0")}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getFullYear()}`;
  const invoiceMonth = today.toLocaleString("default", { month: "long" });

  // Trim string values in formData
  const cleanedFormData = {
      ...formData,
      companyName: formData.companyName.trim(),
      customerName: formData.customerName.trim(),
      jobWorkSupplier: formData.jobWorkSupplier ? formData.jobWorkSupplier.trim() : "",
      date: orderDate,
  };

  // Create the new order with Invoice details
  const newOrder = {
    id: Date.now(),
    invoiceNo: newInvoiceNo,
    invoiceDate: invoiceDate,
    invoiceMonth: invoiceMonth,
    ...cleanedFormData,
    amountPaid: formData.paymentStatus === "Partial" ? formData.amountPaid : "",
    products,
  };

  // Save updated order list
  const updatedOrders = [...existingOrders, newOrder];
    localStorage.setItem("orders", JSON.stringify(updatedOrders));

    alert("Invoice Added Successfully!");
    navigate("/invoice");
  };

  const removeProduct = (indexToRemove) => {
    setProducts((prevProducts) => prevProducts.filter((_, index) => index !== indexToRemove));
  };  

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4" style={{ fontFamily: "Tinos, serif", color: "white", animation: "fadeSlideUp 1.5s ease-out" }}>Add Invoice</h2>

      <form onSubmit={handleSubmit} className="p-4 rounded text-light glow-table" style={{ animation: "fadeSlideUp 1.5s ease-out" }}>
        {/* Company & Customer */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Company Name</label>
            <select className="form-select" name="companyName" value={formData.companyName} onChange={handleChange} required>
              <option value="">Select a Company</option>
              {companies.map((comp, index) => (
                <option key={index} value={comp.companyName}>{comp.companyName}</option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Customer Name</label>
            <input type="text" name="customerName" className="form-control" value={formData.customerName} readOnly />
          </div>
        </div>

        {/* Products Section */}
        <label className="form-label">Product Details</label>
        {products.map((product, index) => (
          <div className="row mb-3" key={index}>
            <div className="col-md-2">
              <input type="text" name="productDetails" className="form-control" placeholder="Product Details" value={product.productDetails} onChange={(e) => handleProductChange(index, e)} required />
            </div>
            <div className="col-md-2">
              <input type="number" name="quantity" className="form-control" placeholder="Quantity" value={product.quantity} onChange={(e) => handleProductChange(index, e)} required />
            </div>
            <div className="col-md-2">
              <select name="unit" className="form-control" value={product.unit} onChange={(e) => handleProductChange(index, e)} required>
                <option value="PCS">PCS</option>
                <option value="MTR">MTR</option>
              </select>
            </div>
            <div className="col-md-2">
              <input type="number" name="price" className="form-control" placeholder="Price" value={product.price} onChange={(e) => handleProductChange(index, e)} required />
            </div>
            <div className="col-md-2">
              <input type="text" name="total" className="form-control" value={product.total} readOnly />
            </div>
            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => removeProduct(index)}
                disabled={products.length === 1}
              >
                –
              </button>
            </div>
          </div>
        ))}
        {/* <button type="button" className="btn btn-success mb-3" onClick={addProduct}>+ Add Product</button> */}
        <button className="btn btn-primary glow-button glow-table mb-3" onClick={addProduct} style={{ animation: "fadeSlideUp 1.5s ease-out", background: "transparent", color: "#fff" }}>
          + Add Invoice
        </button>

        {/* Final Total Section */}
        <div className="mb-3"><strong>Final Total:</strong> ₹{formData.finalTotal}</div>
        {/* Transport Selection */}
        <div className="mb-3">
          <label className="form-label">Transport</label>
          <select name="transport" className="form-control" value={formData.transport} onChange={handleChange}>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        {/* Transport Price (Only if Yes is selected) */}
        {formData.transport === "Yes" && (
          <div className="mb-3">
            <label className="form-label">Transport Price</label>
            <input type="number" name="transportPrice" className="form-control" value={formData.transportPrice} onChange={handleChange} />
          </div>
        )}

        {/* Grand Total */}
        <div className="mb-3"><strong>Grand Total:</strong> ₹{formData.grandTotal}</div>

        {/* GST Selection */}
        <div className="mb-3">
          <label className="form-label">GST</label>
          <select name="gst" className="form-control" value={formData.gst} onChange={handleGSTChange}>
            <option value="">Select GST</option>
            <option value="5%">5%</option>
            <option value="8%">8%</option>
            <option value="12%">12%</option>
            <option value="24%">24%</option>
          </select>
        </div>

        {/* CGST, SGST, IGST Fields (Appear After Selecting GST) */}
        {formData.gst && (
          <>
            <div className="mb-3"><strong>CGST:</strong> ₹{formData.cgst}</div>
            <div className="mb-3"><strong>SGST:</strong> ₹{formData.sgst}</div>
            <div className="mb-3"><strong>IGST:</strong> ₹{formData.igst}</div>
          </>
        )}

        {/* Sales Amount */}
        <div className="mb-3"><strong>Sales Amount:</strong> ₹{formData.salesAmount}</div>

        {/* Job Work / Supplier - Text Box */}
        <div className="mb-3">
          <label className="form-label">Job Work / Supplier</label>
          <input 
            type="text" 
            name="jobWorkSupplier" 
            className="form-control" 
            value={formData.jobWorkSupplier} 
            onChange={handleChange} 
            placeholder="Enter Job Work / Supplier"
            required
          />
        </div>

        {/* Payment Status */}
        <div className="mb-3">
          <label className="form-label">Payment Status</label>
          <select name="paymentStatus" className="form-control" value={formData.paymentStatus} onChange={handleChange} required>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
          </select>
          {formData.paymentStatus === "Partial" && (
            <div className="mt-3 mb-3">
              <label>Amount Paid:</label>
              <input
                type="number"
                name="amountPaid"
                className="form-control"
                value={formData.amountPaid}
                onChange={handleChange}
                placeholder="Enter Amount Paid"
              />
            </div>
          )}
        </div>

        <button type="submit" className="btn text-white bg-dark w-100 glow-table glow-button">Submit Order</button>
      </form>

      {/* Back Button */}
      <div className="text-center mt-4 mb-4">
        <button className="btn btn-secondary" onClick={() => navigate("/invoice")}>Back</button>
      </div>
    </div>
  );
};

export default AddOrder;
