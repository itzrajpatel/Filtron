import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../styles/Chalan.css";

const Chalan = () => {
    const location = useLocation();
    const orderId = location.state?.orderId;
    const [order, setOrder] = useState(null);
    const [company, setCompany] = useState(null);

    // TESTING
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [shippingAddress, setShippingAddress] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const orderRes = await fetch(`http://localhost:5000/api/orders/${orderId}`);
                const orderData = await orderRes.json();
                setOrder(orderData);

                const companyRes = await fetch(`http://localhost:5000/api/companies`);
                const companies = await companyRes.json();

                const matchedCompany = companies.find(c =>
                    c.company_name?.trim().toLowerCase() === orderData.company_name?.trim().toLowerCase()
                );

                setCompany(matchedCompany || null);

                // TESTING
                setShippingAddress((matchedCompany?.address || "").trim());

            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        };

        if (orderId) fetchData();
    }, [orderId]);

    if (!order || !company) {
        return <h3 className="text-center text-danger">Loading Chalan...</h3>;
    }

    if (!order) {
        return <h3 className="text-center text-danger">No order selected</h3>;
    }        

  return (
    <div className="mt-5 mb-5 bg-light chalan-container" style={{ fontFamily: "Arial, sans-serif", border: "2px solid black", width: "800px", margin: "auto" }}>
        <div style={{ padding: "10px 0", borderBottom: "2px solid black" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* Logo */}
                <div style={{ flex: "0 0 100px", textAlign: "center" }}>
                    <img 
                        src="/logo.png" 
                        alt="Filtron Logo" 
                        style={{ width: "140px", height: "140px", borderRadius: "50%", objectFit: "contain" }} 
                    />
                </div>

                {/* Center - Company Name and Slogan */}
                <div style={{ flex: 1, textAlign: "center", fontFamily: "Baskervville SC, serif" }}>
                    <div style={{ fontSize: "50px", fontWeight: "bold", letterSpacing: "2px", textDecoration: "underline" }}>
                        FILTRON TECHNIQUES
                    </div>
                    <div style={{ fontWeight: "600", marginTop: "-10px", textAlign: "end", marginRight: "170px" }}>Do Filtration More Technically</div>
                </div>
            </div>

            {/* Bottom - Description */}
            <div style={{ textAlign: "center", marginTop: "5px", fontSize: "13px" }}>
                Filter fabrics, Filter Press cloths, Centrifuge Bags, Dust collector bags, Cages for Bag house, Belt for belt press
            </div>

            {/* Tagline row */}
            <div style={{ textAlign: "center", marginTop: "5px", fontSize: "14px", fontStyle: "italic", fontWeight: "bold", borderTop: "2px solid black" }}>
                ………PERFORMANCE……….<span style={{ margin: "0 10px" }}>PERFECTION</span>……….<span style={{ margin: "0 10px" }}>QUALITY</span>……….<span style={{ margin: "0 10px" }}>SERVICE</span>………
            </div>
        </div>

      <h3 style={{ textAlign: "center", margin: "20px 0", fontWeight: "bold" }}>DELIVERY CHALAN</h3>
      <div style={{ display: "flex", justifyContent: "space-around", borderTop: "2px solid black", paddingBottom: "5px", paddingTop: "5px" }}>
        <div>
        <strong>CHALAN NO:</strong> {order.invoice_no?.slice(-3)}
        </div>
        <div>
          <strong>CHALAN DATE:</strong> <input type="text" placeholder="Enter date" style={{ height: "20px", width: "100px", padding: "5px", fontSize: "14px", border: "none" }}></input>
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
            {/* Left Section - Biling Address */}
            <div style={{ flex: 1, borderRight: "1px solid black" }}>
                <div style={{ display: "flex", justifyContent: "center", borderBottom: "2px solid black", paddingBottom: "5px", paddingTop: "5px" }}>
                    <div>
                        <strong style={{ textDecoration: "underline" }}>BILING ADDRESS</strong>
                    </div>
                </div>
                <strong style={{ paddingLeft: "5px", marginTop: "10px", display: "block" }}>{company.company_name}</strong>
                <p className="mt-2" style={{ paddingLeft: "5px" }}>
                    {company.address.split("\n").map((line, index) => (
                        <React.Fragment key={index}>
                        {line}
                        <br />
                        </React.Fragment>
                    ))}
                </p>
            </div>

            {/* Right Section - Shiping Address */}
            <div style={{ flex: 1, textAlign: "start" }}>
                <div style={{ display: "flex", justifyContent: "center", borderBottom: "2px solid black", paddingBottom: "5px", paddingTop: "5px" }}>
                    <div>
                        <strong style={{ textDecoration: "underline" }}>SHIPING ADDRESS</strong>
                    </div>
                </div>
                <strong style={{ paddingLeft: "5px", marginTop: "10px", display: "block" }}>{company.company_name}</strong>
                {/* <p className="mt-3" style={{ paddingLeft: "5px" }}>
                    {company.address.split("\n").map((line, index) => (
                        <React.Fragment key={index}>
                        {line}
                        <br />
                        </React.Fragment>
                    ))}
                </p> */}
                {isEditingAddress ? (
                    // <textarea
                    //     className="mt-3"
                    //     style={{ paddingLeft: "5px", width: "95%", fontSize: "14px", border: "1px solid black" }}
                    //     value={shippingAddress}
                    //     onChange={(e) => setShippingAddress(e.target.value)}
                    //     onBlur={() => setIsEditingAddress(false)}
                    //     autoFocus
                    //     rows={4}
                    // />
                    <textarea
                    className="mt-3"
                    style={{ paddingLeft: "5px", width: "95%", fontSize: "14px", border: "1px solid black" }}
                    value={shippingAddress}
                    onChange={(e) => {
                        const limitedLines = e.target.value.split('\n').slice(0, 4);
                        setShippingAddress(limitedLines.join('\n'));
                    }}
                    onKeyDown={(e) => {
                        const lineCount = shippingAddress.split('\n').length;
                        if (e.key === 'Enter' && lineCount >= 4) {
                        e.preventDefault();
                        }
                    }}
                    onBlur={() => setIsEditingAddress(false)}
                    autoFocus
                    rows={4}
                    />
                    ) : (
                    <p
                        className="mt-2"
                        style={{ paddingLeft: "5px", cursor: "pointer" }}
                        onClick={() => setIsEditingAddress(true)}
                        title="Click to edit"
                    >
                        {shippingAddress.split("\n").map((line, index) => (
                        <React.Fragment key={index}>
                            {line}
                            <br />
                        </React.Fragment>
                        ))}
                    </p>
                )}
            </div>
        </div>

        <table className="mb-3" style={{ 
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
                {[...order.products, ...Array(4 - order.products.length).fill({})]
                    .slice(0, 4)
                    .map((product, index) => (
                    <tr key={index} style={{ height: "50px" }}>
                        <td className="text-center" style={{ borderLeft: "1px solid black", padding: "8px" }}>
                        {product.productDetails ? index + 1 : ""}
                        </td>
                        <td className="text-center" style={{ borderLeft: "1px solid black", padding: "8px" }}>
                        {product.productDetails || ""}
                        </td>
                        <td className="text-center" style={{ borderLeft: "1px solid black", padding: "8px" }}>
                        {product.quantity || ""}
                        </td>
                        <td className="text-center" style={{ borderLeft: "1px solid black", padding: "8px" }}>
                        {product.unit || ""}
                        </td>
                        <td className="text-center" style={{ borderLeft: "1px solid black", padding: "8px" }}>
                        {product.price ? `₹${product.price}` : ""}
                        </td>
                        <td className="text-center" style={{ borderLeft: "1px solid black", padding: "8px", fontWeight: "bold" }}>
                        {product.quantity && product.price ? `₹${(product.quantity * product.price).toFixed(2)}` : ""}
                        </td>
                    </tr>
                ))}
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
