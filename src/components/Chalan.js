import React from "react";
import { useLocation } from "react-router-dom";

const Chalan = () => {
    const location = useLocation();
    const order = location.state?.order; // Retrieve order data
    const company = location.state?.company;

    if (!order) {
        return <h3 className="text-center text-danger">No order selected</h3>;
    }        

  return (
    <div className="mt-5 mb-5" style={{ fontFamily: "Arial, sans-serif", border: "2px solid black", width: "800px", margin: "auto" }}>
      <h3 style={{ textAlign: "center", margin: "20px 0", textDecoration: "underline" }}>BUYER DETAILS:</h3>
      <div style={{ display: "flex", justifyContent: "space-around", borderTop: "2px solid black", paddingBottom: "5px", paddingTop: "5px" }}>
        <div>
          <strong>CHALAN NO:</strong> {order.invoiceNo.slice(-3)}
        </div>
        <div>
          <strong>CHALAN DATE:</strong> <input type="text" style={{ height: "20px", width: "100px", padding: "5px", fontSize: "14px", border: "none", borderBottom: "1px solid black" }}></input>
        </div>
      </div>

        <div style={{ 
            borderTop: "2px solid black",
            borderBottom: "2px solid black",
            display: "flex", 
            justifyContent: "space-between",
            alignItems: "start"
            }}
        >
            {/* Left Section - Buyer Details */}
            <div style={{ flex: 1, borderRight: "1px solid black" }}>
                <div style={{ display: "flex", justifyContent: "center", borderBottom: "2px solid black", paddingBottom: "5px", paddingTop: "5px" }}>
                    <div>
                        <strong style={{ textDecoration: "underline" }}>BILING ADDRESS</strong>
                    </div>
                </div>
                <strong style={{ paddingLeft: "5px" }}>{company.companyName}</strong>
                <p className="mt-3" style={{ lineHeight: "2.3", paddingLeft: "10px" }}>
                    {company.address.split("\n").map((line, index) => (
                        <React.Fragment key={index}>
                        {line}
                        <br />
                        </React.Fragment>
                    ))}
                </p>
            </div>

            {/* Right Section - GSTIN & Other Details */}
            <div style={{ flex: 1, textAlign: "start" }}>
                <div style={{ display: "flex", justifyContent: "center", borderBottom: "2px solid black", paddingBottom: "5px", paddingTop: "5px" }}>
                    <div>
                        <strong style={{ textDecoration: "underline" }}>SHIPING ADDRESS</strong>
                    </div>
                </div>
                <strong style={{ paddingLeft: "5px" }}>{company.companyName}</strong>
                <p className="mt-3" style={{ lineHeight: "2.3", paddingLeft: "10px" }}>
                    {company.address.split("\n").map((line, index) => (
                        <React.Fragment key={index}>
                        {line}
                        <br />
                        </React.Fragment>
                    ))}
                </p>
            </div>
        </div>

        <table style={{ 
            width: "100%",
            marginTop: "20px",
            borderCollapse: "collapse", 
            borderTop: "2px solid black",
            borderBottom: "2px solid black"
            }}
        >
            <thead>
                <tr style={{ borderBottom: "1px solid black", backgroundColor: "#f0f0f0" }}>
                <th className="text-center" style={{ padding: "8px" }}>SR. NO</th>
                <th className="text-center" style={{ border: "1px solid black", padding: "8px" }}>MATERIAL DESCRIPTION</th>
                <th className="text-center" style={{ border: "1px solid black", padding: "8px" }}>QUANTITY</th>
                <th className="text-center" style={{ border: "1px solid black", padding: "8px" }}>UNIT</th>
                <th className="text-center" style={{ border: "1px solid black", padding: "8px" }}>RATE</th>
                <th className="text-center" style={{ padding: "8px" }}>TOTAL AMOUNT</th>
                </tr>
            </thead>
            <tbody>
                {order.products && order.products.length > 0 ? (
                    order.products.map((product, index) => (
                    <tr key={index}>
                        <td className="text-center" style={{ borderBottom: "1px solid black", padding: "8px" }}>{index + 1}</td>
                        <td className="text-center" style={{ border: "1px solid black", padding: "8px" }}>{product.productDetails || "N/A"}</td>
                        <td className="text-center" style={{ border: "1px solid black", padding: "8px" }}>{product.quantity || 0}</td>
                        <td className="text-center" style={{ border: "1px solid black", padding: "8px" }}>{product.unit || "N/A"}</td>
                        <td className="text-center" style={{ border: "1px solid black", padding: "8px" }}>₹{product.price || 0}</td>
                        <td className="text-center" style={{ borderBottom: "1px solid black", padding: "8px" }}>₹{(product.quantity * product.price).toFixed(2) || 0}</td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan="6" className="text-center">No Products Available</td>
                    </tr>
                )}
            </tbody>
        </table>

        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid black" }}>
            {/* Left Section - Payment & Delivery Terms */}
            <div style={{ flex: 1, textAlign: "start", borderRight: "1px solid black", display: "flex", flexDirection: "column" }}>
                <p style={{ paddingLeft: "5px", borderBottom: "1px solid black" }}> RECEIVER' S SIGN: </p>
            </div>

            {/* Middle Section - Payment & Delivery Terms */}
            <div style={{ flex: 1, textAlign: "start", borderRight: "1px solid black", display: "flex", flexDirection: "column" }}>
                <div style={{ flex: 1, textAlign: "start", borderRight: "1px solid black", display: "flex", flexDirection: "column" }}>
                    <p style={{ paddingLeft: "5px", borderBottom: "1px solid black" }}> REMARKS: </p>
                </div>
            </div>

            {/* Right Section - Authorized Signatory */}
            <div style={{ flex: 1, textAlign: "start" }}>
                <strong style={{ paddingLeft: "5px" }}>For, <strong style={{ textDecoration: "underline" }}> FILTRON TECHNIQUES</strong></strong>
                <p style={{ marginTop: "70px", paddingLeft: "5px", fontWeight: "bolder" }}>Authorized Signatory</p>
            </div>
        </div>
    </div>
  );
};

export default Chalan;
