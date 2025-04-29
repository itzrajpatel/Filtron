import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../styles/Bill.css"

const CreateBill = () => {
    const location = useLocation();
    const orderId = location.state?.orderId;

    const [order, setOrder] = useState(null);
    const [company, setCompany] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/orders/${orderId}`);
            const data = await res.json();
            setOrder(data);

            // Fetch company info
            const compRes = await fetch(`http://localhost:5000/api/companies`);
            const companies = await compRes.json();
            const matched = companies.find(c => 
            c.company_name?.trim().toLowerCase() === data.company_name?.trim().toLowerCase()
            );

            if (!matched) {
            console.warn(`Company not found for order: ${data.company_name}`);
            }

            setCompany(matched || {});
        } catch (err) {
            console.error("Failed to fetch order or company:", err);
        }
        };

        if (orderId) fetchOrderDetails();
    }, [orderId]);

    if (!order || !company) {
        return <h3 className="text-center text-danger">Loading Invoice...</h3>;
    }

    const convertNumberToWords = (num) => {
        if (!num || isNaN(num)) return "Zero Rupees Only";
    
        const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
        const teens = ["Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
        const tens = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
        
        const denominations = [
            { value: 10000000, name: "Crore" },
            { value: 100000, name: "Lakh" },
            { value: 1000, name: "Thousand" },
            { value: 100, name: "Hundred" }
        ];
    
        let word = "";
        let integerPart = Math.floor(num);
        let decimalPart = Math.round((num - integerPart) * 100); // Consider only 2 decimal places
    
        const getWords = (n) => {
            if (n === 0) return "";
            if (n < 10) return ones[n];
            if (n >= 11 && n <= 19) return teens[n - 11];
            return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
        };
    
        for (let { value, name } of denominations) {
            if (integerPart >= value) {
                let quotient = Math.floor(integerPart / value);
                word += getWords(quotient) + " " + name + " ";
                integerPart %= value;
            }
        }
    
        if (integerPart > 0) {
            word += getWords(integerPart) + " ";
        }
    
        word = word.trim() + " Rupees";
    
        if (decimalPart > 0) {
            let paiseWords = getWords(decimalPart).trim();
            word += ` and ${paiseWords} Paise`;
        }
    
        return word + " Only";
    };                

  return (
    <div className="invoice-container">
        <h3 className="text-center text-light invoice-title" style={{ margin: "0 0", marginLeft: "300px" }}> TAX INVOICE <span style={{ fontSize: "15px", marginLeft: "120px" }}> ORIGINAL FOR RECIPIENT </span></h3>
        <div className="bg-light" style={{ fontFamily: "Arial, sans-serif", border: "2px solid black", width: "800px", margin: "auto" }}>
        <div style={{ backgroundColor: "#e5e7e9", display: "flex", justifyContent: "space-around", borderBottom: "2px solid black", paddingBottom: "5px", paddingTop: "5px" }}>
            <div>
            <strong>INVOICE NO.</strong> {order.invoice_no}
            </div>
            <div>
            <strong>CHALAN NO:</strong> {order.invoice_no.slice(-3)}
            </div>
            <div>
            <strong>INVOICE DATE:</strong> {order.invoice_date}
            </div>
        </div>

        <h3 className="mt-1" style={{ textAlign: "center", fontSize: "20px", fontFamily: "tinos", textDecoration: "underline" }}>BUYER DETAILS:</h3>

            <div style={{ 
                borderTop: "2px solid black",
                borderBottom: "2px solid black",
                display: "flex", 
                justifyContent: "space-between",
                alignItems: "start"
                }}
            >
                {/* Left Section - Buyer Details */}
                <div style={{ flex: 1, paddingRight: "10px" }}>
                    <p className="mt-1"><strong style={{ marginBottom: "2px", paddingLeft: "10px", fontSize: "15px" }}>{company.company_name}</strong></p>
                    {/* <p style={{ lineHeight: "1.5", paddingLeft: "25px", fontSize: "15.5px", margin: "-15px", paddingBottom: "15px" }}>
                        {company.address.split("\n").map((line, index) => (
                            <React.Fragment key={index}>
                            {line}
                            <br />
                            </React.Fragment>
                        ))}
                    </p> */}
                    <p style={{ lineHeight: "1.5", paddingLeft: "25px", fontSize: "15.5px", margin: "-15px", paddingBottom: "15px" }}>
                        {(company.address ? company.address.split("\n") : []).map((line, index) => (
                            <React.Fragment key={index}>
                            {line}
                            <br />
                            </React.Fragment>
                        ))}
                    </p>
                </div>

                {/* Right Section - GSTIN & Other Details */}
                <div style={{ flex: 1, paddingLeft: "10px", textAlign: "start", borderLeft: "1px solid black" }}>
                    <p className="mt-1" style={{ fontSize: "13px", margin: "4px 0" }}><strong>GSTIN NO.:</strong> {company.gst_no || "N/A"} </p>
                    <p style={{ fontSize: "13px", margin: "4px 0" }}><strong>STATE:</strong> {company.state} </p>
                    <p style={{ fontSize: "13px", margin: "4px 0" }}><strong>STATE CODE:</strong> {company.state_code} </p>
                    <p style={{ fontSize: "13px", margin: "4px 0" }}><strong>PO REFF:</strong> <input type="text" placeholder="Enter PO REFF" style={{ height: "20px", width: "150px", fontSize: "13px", padding: "5px", border: "none" }}></input> </p>
                    <p style={{ fontSize: "13px", margin: "4px 0" }}><strong>PO DATE:</strong> <input type="text" placeholder="Enter PO DATE" style={{ height: "20px", width: "150px", fontSize: "13px", padding: "5px", border: "none" }}></input> </p>
                </div>
            </div>

            <table className={`product-table ${
                order.products.length <= 3
                ? "few-products"
                : order.products.length <= 6
                ? "medium-products"
                : "many-products"
            }`}
            style={{ 
                width: "100%",
                marginTop: "10px",
                borderCollapse: "collapse", 
                borderTop: "2px solid black",
                borderBottom: "2px solid black",
                }}
            >
                <thead>
                    <tr style={{ borderBottom: "1px solid black", backgroundColor: "#f0f0f0" }}>
                    <th className="text-center" style={{ padding: "8px" }}>SR. NO</th>
                    <th className="text-center" style={{ border: "1px solid black" }}>HSN CODE</th>
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
                            <td className="text-center" style={{ border: "1px solid black" }}><input type="text" placeholder="Enter HSN code" style={{ fontSize: "13px", padding: "5px", border: "none", textAlign: "center" }}></input></td>
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

            <div style={{ display: "flex", marginTop: "10px", borderBottom: "2px solid black", borderTop: "2px solid black" }}>
                {/* Left Section - Bank Details */}
                <div style={{ flex: 1 }}>
                    <h4 className="text-center" style={{ padding: "10px", fontSize: "20px", textDecoration: "underline", backgroundColor: "#d7dbdd" }}>BANK DETAILS FOR NEFT / RTGS</h4>
                    <p style={{ paddingLeft: "10px", margin: "2px 0" }}><strong>BANK NAME:</strong> HDFC BANK LTD</p>
                    <p style={{ paddingLeft: "10px", margin: "2px 0" }}><strong>BRANCH:</strong> MEMNAGAR / GURUKUL AHMEDABAD</p>
                    <p style={{ paddingLeft: "10px", margin: "2px 0" }}><strong>A/C NO:</strong> 50200027039621</p>
                    <p style={{ paddingLeft: "10px", margin: "2px 0" }}><strong>IFSC CODE:</strong> HDFC0001675</p>
                </div>

                {/* Right Section - Amount Details */}
                <div style={{ flex: 1, padding: "2px", borderLeft: "1px solid black", textAlign: "start" }}>
                    <p style={{ margin: "1px 0", fontSize: "13px" }}>GRAND TOTAL: ₹{order.final_total}</p>
                    <hr style={{ margin: "1px 0", borderTop: "1px solid black" }} />
                    
                    <p style={{ margin: "1px 0", fontSize: "13px" }}>TRANSPORTATION CHARGES: {order.transport === "Yes" ? `₹${order.transport_price}` : "₹0"}</p>
                    <hr style={{ margin: "1px 0", borderTop: "1px solid black" }} />
                    
                    <p style={{ margin: "1px 0", fontSize: "13px" }}><strong>TOTAL TAXABLE AMOUNT:</strong> ₹{order.grand_total}</p>
                    <hr style={{ margin: "1px 0", borderTop: "1px solid black" }} />
                    
                    <p style={{ margin: "1px 0", fontSize: "13px" }}>CGST @ 6%: ₹{order.cgst}</p>
                    <hr style={{ margin: "1px 0", borderTop: "1px solid black" }} />
                    
                    <p style={{ margin: "1px 0", fontSize: "13px" }}>SGST @ 6%: ₹{order.sgst}</p>
                    <hr style={{ margin: "1px 0", borderTop: "1px solid black" }} />
                    
                    <p style={{ margin: "1px 0", fontSize: "13px" }}>IGST @ 12%: ₹{order.igst}</p>
                    <hr style={{ margin: "1px 0", borderTop: "1px solid black" }} />
                    
                    <p style={{ margin: "1px 0", fontSize: "13px" }}><strong>TOTAL AMOUNT:</strong> ₹{order.sales_amount}</p>
                </div>
            </div>

            <strong>Amount Chargeable (in words):- {convertNumberToWords(order.sales_amount)}</strong>
            <p className="text-end mt-3" style={{ margin: "5px 0" }}> Remarks :- Total Amount is rounded off to the nearest value </p>

            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid black" }}>
                {/* Left Section - Payment & Delivery Terms */}
                <div style={{ flex: 1.5, textAlign: "start", borderRight: "1px solid black", display: "flex", flexDirection: "column" }}>
                    
                    {/* Top Section - Payment & Delivery Terms */}
                    <div style={{ borderBottom: "1px solid black", textAlign: "center" }}>
                        <p style={{ paddingLeft: "5px", margin: "5px 0" }}><strong>Payment Terms :</strong> <input type="text" placeholder="Enter Payment Terms" style={{ height: "20px", width: "150px", padding: "5px", fontSize: "14px", border: "none", textAlign: "center" }}></input> </p>
                        <p style={{ paddingLeft: "5px", margin: "5px 0" }}><strong>Delivery Terms :</strong> <input type="text" placeholder="Enter Delivery Terms" style={{ height: "20px", width: "150px", padding: "5px", fontSize: "14px", border: "none", textAlign: "center" }}></input> </p>
                        <p style={{ paddingLeft: "25px", margin: "5px 0" }}><strong>Booking For :</strong> <input type="text" placeholder="Enter Booking For" style={{ height: "20px", width: "150px", padding: "5px", fontSize: "14px", border: "none", textAlign: "center" }}></input></p>
                    </div>

                    {/* Bottom Section - Company Registration Details */}
                    <div >
                        <p style={{ paddingLeft: "5px", margin: "5px 0" }}><strong>COMPANY REGISTRATION DETAILS:-</strong></p>
                        
                        {/* Row 1: GSTIN & STATE */}
                        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                            <p style={{ paddingLeft: "5px", fontSize: "14px" }}><strong>GSTIN:</strong> 24AKXPP2376H1ZL </p>
                            <p style={{ paddingRight: "10px", fontSize: "14px" }}><strong>STATE:</strong> GUJARAT </p>
                        </div>

                        {/* Row 2: I/E CODE & STATE CODE */}
                        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", }}>
                            <p style={{ paddingLeft: "5px", fontSize: "14px" }}><strong>I/E CODE:</strong> AKXPP2376H </p>
                            <p style={{ paddingRight: "15px", fontSize: "14px" }}><strong>STATE CODE:</strong> 24 </p>
                        </div>
                    </div>
                </div>

                {/* Right Section - Authorized Signatory */}
                <div style={{ flex: 1, textAlign: "start" }}>
                    <strong style={{ paddingLeft: "5px" }}>For, <strong style={{ textDecoration: "underline" }}> FILTRON TECHNIQUES, AHMEDABAD</strong></strong>
                    <p style={{ marginTop: "105px", paddingLeft: "5px", fontWeight: "bolder" }}>Authorized Signatory</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default CreateBill;
