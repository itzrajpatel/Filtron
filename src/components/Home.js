import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  const [companies, setCompanies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCompanies = JSON.parse(localStorage.getItem("companies")) || [];
    setCompanies(savedCompanies);
  }, []);

  // Function to handle redirection
  const handleOrderHistory = (company) => {
    navigate("/invoice-history", { state: { companyName: company.companyName } })  // Pass order details if needed
  };

  return (
    // <div className="container mt-4">
    //   <div className="d-flex justify-content-between align-items-center mb-4">
    //     <h2 className="mt-3">Company Details</h2>
    //     <button className="btn btn-primary me-2" onClick={() => navigate("/add-company")}>Add Company</button>
    //   </div>

    //   <table className="table table-bordered table-striped">
    //     <thead className="table-dark">
    //       <tr>
    //         <th>Sr No.</th>
    //         <th>Company Name</th>
    //         <th>Customer Name</th>
    //         <th>Address</th>
    //         <th>State</th>
    //         <th>State Code</th>
    //         <th>Contact</th>
    //         <th>Email</th>
    //         <th>GST No</th>
    //       </tr>
    //     </thead>
    //     <tbody>
    //       {companies.length > 0 ? (
    //         companies.map((company, index) => (
    //           <tr key={index}>
    //             <td>{index + 1}</td>
    //             <td>
    //               <span 
    //                 onClick={() => handleOrderHistory(company)}
    //                 style={{ cursor: "pointer", color: "black", textDecoration: "none" }}
    //                 onMouseOver={(e) => e.target.style.color = "red"}
    //                 onMouseOut={(e) => e.target.style.color = "black"}
    //                 title="Click to view Invoice History"
    //               >
    //                 {company.companyName}
    //               </span>
    //             </td>
    //             <td>{company.customerName}</td>
    //             <td>
    //                 {company.address.split("\n").map((line, index) => (
    //                   <React.Fragment key={index}>
    //                   {line}
    //                   <br />
    //                   </React.Fragment>
    //                 ))}
    //             </td>
    //             <td>{company.state}</td>
    //             <td>{company.stateCode}</td>
    //             <td>{company.contact}</td>
    //             <td>{company.email}</td>
    //             <td>{company.gstNo || "N/A"}</td>
    //           </tr>
    //         ))
    //       ) : (
    //         <tr>
    //           <td colSpan="11" className="text-center">No companies added yet</td>
    //         </tr>
    //       )}
    //     </tbody>
    //   </table>
    // </div>
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mt-3" style={{ fontFamily: "DM Serif Text, serif", color: "white", animation: "fadeSlideUp 1.5s ease-out" }}>Company Details</h2>
        <button className="btn btn-primary me-2 glow-button glow-table" onClick={() => navigate("/add-company")} style={{ animation: "fadeSlideUp 1.5s ease-out", backgroundColor: "transparent", color: "#fff", padding: "12px 24px", fontWeight: "600", fontSize: "16px", cursor: "pointer" }}> + Add Company</button>
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
            {companies.length > 0 ? (
              companies.map((company, index) => (
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
                  <td className="table-dark text-center">{company.contact}</td>
                  <td className="table-dark text-center">{company.email}</td>
                  <td className="table-dark text-center">{company.gstNo || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="text-center">No companies added yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
