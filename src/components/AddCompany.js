import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AddCompany.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddCompany = () => {
  const [companyData, setCompanyData] = useState({
    companyName: "",
    customerName: "",
    address: "",
    state: "",
    stateCode: "",
    contact: "",
    email: "",
    gstNo: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyData({ ...companyData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch("http://localhost:5000/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyData),
      });
  
      if (response.ok) {
        toast.success("Company Added Successfully!");
        setTimeout(() => navigate("/company"), 2000); // small delay before redirect
      } else {
        toast.error("Error adding company.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  return (
    <div className="container mt-5">
      <ToastContainer />
      <h2 className="text-center mb-4 text-light" style={{ animation: "fadeSlideUp 1.5s ease-out" }}>Add New Company</h2>

      <form onSubmit={handleSubmit} className="p-4 rounded text-light glow-table" style={{ animation: "fadeSlideUp 1.5s ease-out" }}>
        {/* Company Name & Customer Name */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Company Name</label>
            <input type="text" name="companyName" className="form-control" value={companyData.companyName} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Customer Name</label>
            <input type="text" name="customerName" className="form-control" value={companyData.customerName} onChange={handleChange} required />
          </div>
        </div>

        {/* Address (Larger Textarea) */}
        <div className="mb-3">
          <label className="form-label">Address</label>
          <textarea name="address" className="form-control" value={companyData.address} onChange={handleChange} rows="3" required></textarea>
        </div>

        {/* State & State Code */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">State</label>
            <input type="text" name="state" className="form-control" value={companyData.state} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">State Code</label>
            <input type="number" name="stateCode" className="form-control" value={companyData.stateCode} onChange={handleChange} onWheel={(e) => e.target.blur()} required />
          </div>
        </div>

        {/* Contact & Email */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Contact</label>
            <input
              type="tel"
              name="contact"
              className="form-control"
              value={companyData.contact}
              onChange={handleChange}
              pattern="^[0-9]{10}$"
              maxLength={10}
              title="Please enter a valid contact number (only 10 digits)"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-control" value={companyData.email} onChange={handleChange} required />
          </div>
        </div>

        {/* GST No */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">GST No</label>
            <input 
              type="text" 
              name="gstNo" 
              className="form-control" 
              value={companyData.gstNo} 
              onChange={handleChange} 
              maxLength={15} // GST No in India is 15 characters long
              minLength={15}
              pattern="[0-9A-Z]{15}" // Ensures only numbers and capital letters are allowed
              title="GST number must be exactly 15 characters long and contain only digits and capital letters"
            />
          </div>
        </div>

        <button type="submit" className="btn text-light bg-dark w-100 glow-button glow-table">Add Company</button>
      </form>

      {/* Back Button */}
      <div className="text-center mt-4 mb-4">
        <button className="btn btn-secondary" onClick={() => navigate("/company")}>Back</button>
      </div>
    </div>
  );
};

export default AddCompany;
