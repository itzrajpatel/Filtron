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

    // Sending Email
    const handleEmailInvoice = async () => {
        if (!company?.email) {
            alert("No email found for the company.");
            return;
        }

        try {
            const invoiceHTML = document.querySelector(".invoice-container").innerHTML;

            const res = await fetch("http://localhost:5000/api/send-invoice-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to: company.email,
                subject: `Invoice ${order.invoice_no} from Filtron Techniques`,
                html: invoiceHTML
            })
            });

            const result = await res.json();
            if (res.ok) {
            alert("Invoice emailed successfully!");
            } else {
            alert(`Failed to send email: ${result.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error sending email:", error);
            alert("An error occurred while sending the invoice.");
        }
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

        <h3 className="mt-1" style={{ textAlign: "center", fontSize: "13px", fontFamily: "tinos", textDecoration: "underline", fontWeight: "bold" }}>BUYER DETAILS:</h3>

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
                    <p style={{ lineHeight: "1.5", paddingLeft: "25px", fontSize: "14.5px", margin: "-15px" }}>
                        {(company.address ? company.address.split("\n") : []).map((line, index) => (
                            <React.Fragment key={index}>
                            {line}
                            <br />
                            </React.Fragment>
                        ))}
                    </p>
                </div>

                {/* Right Section - GSTIN & Other Details */}
                <div style={{ flex: 1, paddingLeft: "10px", borderLeft: "1px solid black" }}>
                    {[
                        { label: "GSTIN NO.:", value: company.gst_no || "-" },
                        { label: "STATE:", value: company.state },
                        { label: "STATE CODE:", value: company.state_code },
                    ].map((item, index) => (
                        <div key={index} style={{ display: "flex", fontSize: "12px", margin: "4px 0" }}>
                            <div style={{ flex: 1, textAlign: "start", fontWeight: "bold" }}>{item.label}</div>
                            <div style={{ flex: 1, textAlign: "center" }}>{item.value}</div>
                            <div style={{ flex: 1 }}></div>
                        </div>
                    ))}

                    <div style={{ display: "flex", fontSize: "12px", margin: "4px 0", alignItems: "center" }}>
                        <div style={{ flex: 1, textAlign: "start", fontWeight: "bold" }}>PO REFF:</div>
                        <div style={{ flex: 1, textAlign: "center" }}>
                            <input 
                                type="text" 
                                placeholder="Enter PO REFF" 
                                style={{ height: "20px", width: "150px", fontSize: "13px", padding: "5px", border: "none", backgroundColor: "transparent", textAlign: "center" }}
                            />
                        </div>
                        <div style={{ flex: 1 }}></div>
                    </div>

                    <div style={{ display: "flex", fontSize: "12px", margin: "4px 0", alignItems: "center" }}>
                        <div style={{ flex: 1, textAlign: "start", fontWeight: "bold" }}>PO DATE:</div>
                        <div style={{ flex: 1, textAlign: "center" }}>
                            <input 
                                type="text" 
                                placeholder="Enter PO DATE" 
                                style={{ height: "20px", width: "150px", fontSize: "13px", padding: "5px", border: "none", backgroundColor: "transparent", textAlign: "center" }}
                            />
                        </div>
                        <div style={{ flex: 1 }}></div>
                    </div>
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
                    {[...order.products, ...Array(4 - order.products.length).fill({})]
                        .slice(0, 4)
                        .map((product, index) => (
                        <tr key={index} style={{ height: "50px" }}>
                            <td className="text-center" style={{ padding: "8px" }}>{product.productDetails ? index + 1 : ""}</td>
                            <td className="text-center" style={{ borderLeft: "1px solid black" }}>{product.hsnNo || ""}</td>
                            <td className="text-center" style={{ borderLeft: "1px solid black", padding: "8px" }}>{product.productDetails || ""}</td>
                            <td className="text-center" style={{ borderLeft: "1px solid black", padding: "8px" }}>{product.quantity || ""}</td>
                            <td className="text-center" style={{ borderLeft: "1px solid black", padding: "8px" }}>{product.unit || ""}</td>
                            <td className="text-center" style={{ borderLeft: "1px solid black", padding: "8px" }}>{product.price ? `₹${product.price}` : ""}</td>
                            <td className="text-center" style={{ borderLeft: "1px solid black", padding: "8px", fontWeight: "bold" }}>
                                {product.quantity && product.price ? `₹${(product.quantity * product.price).toFixed(2)}` : ""}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ display: "flex", marginTop: "10px", borderBottom: "2px solid black", borderTop: "2px solid black" }}>
                {/* Left Section - Bank Details */}
                <div style={{ flex: 1 }}>
                    <h4 className="text-center" style={{ padding: "10px", fontSize: "13px", textDecoration: "underline", backgroundColor: "#d7dbdd", borderBottom: "1px solid black" }}>BANK DETAILS FOR NEFT / RTGS</h4>
                    <p style={{ fontSize: "12px", paddingLeft: "10px", margin: "2px 0" }}><strong>BANK NAME:</strong> HDFC BANK LTD</p>
                    <p style={{ fontSize: "12px", paddingLeft: "10px", margin: "2px 0" }}><strong>BRANCH:</strong> MEMNAGAR / GURUKUL AHMEDABAD</p>
                    <p style={{ fontSize: "12px", paddingLeft: "10px", margin: "2px 0" }}><strong>A/C NO:</strong> 50200027039621</p>
                    <p style={{ fontSize: "12px", paddingLeft: "10px", margin: "2px 0" }}><strong>IFSC CODE:</strong> HDFC0001675</p>
                </div>

                {/* Right Section - Amount Details */}
                <div style={{ flex: 1, padding: "2px", borderLeft: "1px solid black", textAlign: "start" }}>
                    <p style={{ margin: "1px 0", fontSize: "11px" }}>GRAND TOTAL: ₹{order.final_total}</p>
                    <hr style={{ margin: "1px 0", borderTop: "1px solid black" }} />
                    
                    <p style={{ margin: "1px 0", fontSize: "11px" }}>TRANSPORTATION CHARGES: {order.transport === "Yes" ? `₹${order.transport_price}` : "₹0"}</p>
                    <hr style={{ margin: "1px 0", borderTop: "1px solid black" }} />
                    
                    <p style={{ margin: "1px 0", fontSize: "11px" }}><strong>TOTAL TAXABLE AMOUNT: ₹{order.grand_total}</strong></p>
                    <hr style={{ margin: "1px 0", borderTop: "1px solid black" }} />
                    
                    <p style={{ margin: "1px 0", fontSize: "11px" }}>CGST @ 6%: ₹{order.cgst}</p>
                    <hr style={{ margin: "1px 0", borderTop: "1px solid black" }} />
                    
                    <p style={{ margin: "1px 0", fontSize: "11px" }}>SGST @ 6%: ₹{order.sgst}</p>
                    <hr style={{ margin: "1px 0", borderTop: "1px solid black" }} />
                    
                    <p style={{ margin: "1px 0", fontSize: "11px" }}>IGST @ 12%: ₹{order.igst}</p>
                    <hr style={{ margin: "1px 0", borderTop: "1px solid black" }} />
                    
                    <p style={{ margin: "1px 0", fontSize: "11px" }}><strong>TOTAL AMOUNT: ₹{order.sales_amount}</strong></p>
                </div>
            </div>

            <strong style={{ fontSize: "14px" }}>Amount Chargeable (in words):- {convertNumberToWords(order.sales_amount)}</strong>
            <p className="text-end mt-3" style={{ fontSize: "13px" ,margin: "5px 0" }}> Remarks :- Total Amount is rounded off to the nearest value </p>

            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid black" }}>
                {/* Left Section - Payment & Delivery Terms */}
                <div style={{ flex: 1.5, textAlign: "start", borderRight: "1px solid black", display: "flex", flexDirection: "column" }}>
                    
                    {/* Top Section - Payment & Delivery Terms */}
                    <div style={{ borderBottom: "1px solid black", textAlign: "center" }}>
                        <p style={{ fontSize: "12px", paddingLeft: "5px", margin: "5px 0" }}><strong>Payment Terms :</strong> <input type="text" placeholder="Enter Payment Terms" style={{ height: "13px", width: "150px", padding: "5px", fontSize: "13px", border: "none", textAlign: "center", backgroundColor: "transparent" }}></input> </p>
                        <p style={{ fontSize: "12px", paddingLeft: "5px", margin: "5px 0" }}><strong>Delivery Terms :</strong> <input type="text" placeholder="Enter Delivery Terms" style={{ height: "13px", width: "150px", padding: "5px", fontSize: "13px", border: "none", textAlign: "center", backgroundColor: "transparent" }}></input> </p>
                        <p style={{ fontSize: "12px", paddingLeft: "20px", margin: "5px 0" }}><strong>Booking For :</strong> <input type="text" placeholder="Enter Booking For" style={{ height: "13px", width: "150px", padding: "5px", fontSize: "13px", border: "none", textAlign: "center", backgroundColor: "transparent" }}></input></p>
                    </div>

                    {/* Bottom Section - Company Registration Details */}
                    <div>
                        <p style={{ fontSize: "13px", paddingLeft: "5px", margin: "5px 0", textDecoration: "underline" }}><strong>COMPANY REGISTRATION DETAILS:-</strong></p>
                        
                        {/* Row 1: GSTIN & STATE */}
                        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                            <p style={{ paddingLeft: "5px", fontSize: "12px" }}><strong>GSTIN:</strong> 24AKXPP2376H1ZL </p>
                            <p style={{ paddingRight: "10px", fontSize: "12px" }}><strong>STATE:</strong> GUJARAT </p>
                        </div>

                        {/* Row 2: I/E CODE & STATE CODE */}
                        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", }}>
                            <p style={{ paddingLeft: "5px", fontSize: "12px" }}><strong>I/E CODE:</strong> AKXPP2376H </p>
                            <p style={{ paddingRight: "15px", fontSize: "12px" }}><strong>STATE CODE:</strong> 24 </p>
                        </div>
                    </div>
                </div>

                {/* Right Section - Authorized Signatory */}
                <div style={{ flex: 1, textAlign: "start" }}>
                    <strong style={{ paddingLeft: "5px" }}>For, <strong style={{ textDecoration: "underline", fontSize: "15px" }}> FILTRON TECHNIQUES, AHMEDABAD</strong></strong>
                    <p className="sign" style={{ marginTop: "100px", paddingLeft: "10px", fontWeight: "bolder" }}>Authorized Signatory</p>
                </div>
            </div>
        </div>

        <div className="text-center mt-5 mb-5 no-print">
            <button
            className="btn btn-primary glow-button glow-table"
            onClick={handleEmailInvoice}
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
                Email
            </button>
        </div>
    </div>
  );
};

export default CreateBill;
