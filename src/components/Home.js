import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/companies");
        const data = await response.json();
        console.log("Raw response from backend:", data); // 👈 check if it's an array
  
        const formatted = data.map(c => ({
          companyName: c.company_name,
          customerName: c.customer_name,
          address: c.address,
          state: c.state,
          stateCode: c.state_code,
          contact: c.contact,
          email: c.email,
          gstNo: c.gst_no,
        }));
  
        console.log("Formatted company list:", formatted); // 👈 confirm formatting
        setCompanies(formatted);       
      } catch (err) {
        console.error("Failed to fetch companies:", err);
      }
    };
  
    fetchCompanies();
  }, []);    

  // Function to handle redirection
  const handleOrderHistory = (company) => {
    navigate("/invoice-history", { state: { companyName: company.companyName } })  // Pass order details if needed
  };

  const filteredCompanies = companies.filter((company) => {
    const term = searchTerm.toLowerCase();
    return (
      company.companyName.toLowerCase().includes(term) ||
      company.customerName.toLowerCase().includes(term) ||
      company.state.toLowerCase().includes(term) ||
      company.email.toLowerCase().includes(term) ||
      company.gstNo.toLowerCase().includes(term)
    );
  });  

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mt-3" style={{ fontFamily: "DM Serif Text, serif", color: "white", animation: "fadeSlideUp 1.5s ease-out" }}>Company Details</h2>
        <button className="btn btn-primary me-2 glow-button glow-table" onClick={() => navigate("/add-company")} style={{ animation: "fadeSlideUp 1.5s ease-out", backgroundColor: "transparent", color: "#fff", padding: "12px 24px", fontWeight: "600", fontSize: "16px", cursor: "pointer" }}> + Add Company</button>
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="🔍  Search by Company, Customer, State, Email, GST No"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: "400px", marginBottom: "10px" }}
        />
      </div>

      <div className="table-responsive glow-table scroll-container" style={{ animation: "fadeSlideUp 1.5s ease-out", borderRadius: "12px", overflowX: "auto", scrollbarColor: "white transparent" }}>
        <table className="table table-bordered table-striped" style={{ border: "1px solid grey" }}>
          <thead className="table-dark">
            <tr>
              <th className="text-center">Sr No.</th>
              <th className="text-center">Company Name</th>
              <th className="text-center">Customer Name</th>
              <th className="text-center">Address</th>
              <th className="text-center">State</th>
              <th className="text-center">State Code</th>
              <th className="text-center">Contact</th>
              <th className="text-center">Email</th>
              <th className="text-center">GST No</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((company, index) => (
                <tr key={index}>
                  <td className="table-dark text-center">{index + 1}</td>
                  <td className="table-dark text-center">
                    <span 
                      onClick={() => handleOrderHistory(company)}
                      style={{ cursor: "pointer", textDecoration: "none" }}
                      onMouseOver={(e) => e.target.style.color = "red"}
                      onMouseOut={(e) => e.target.style.color = "white"}
                      title="Click to view Invoice History"
                    >
                      {company.companyName}
                    </span>
                  </td>
                  <td className="table-dark text-center">{company.customerName}</td>
                  <td className="table-dark text-center">
                    {company.address.split("\n").map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </td>
                  <td className="table-dark text-center">{company.state}</td>
                  <td className="table-dark text-center">{company.stateCode}</td>
                  <td className="table-dark text-center" style={{ whiteSpace: "nowrap" }}>+91 {company.contact}</td>
                  <td className="table-dark text-center">{company.email}</td>
                  <td className="table-dark text-center">{company.gstNo || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="text-center bg-dark text-light">No companies added yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
