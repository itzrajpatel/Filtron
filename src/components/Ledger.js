import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Ledger = () => {
  const [orders, setOrders] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    const fetchOrdersAndCompanies = async () => {
        try {
        const [ordersRes, companiesRes] = await Promise.all([
            fetch("http://localhost:5000/api/orders"),
            fetch("http://localhost:5000/api/companies")
        ]);

        const ordersData = await ordersRes.json();
        const companiesData = await companiesRes.json();

        const companyMap = companiesData.reduce((acc, company) => {
            const key = company.company_name.trim().toLowerCase();
            acc[key] = company.gst_no;
            return acc;
        }, {});

        const enrichedOrders = ordersData.map(order => {
            const normalizedName = order.company_name.trim().toLowerCase();
            return {
            ...order,
            gstNo: companyMap[normalizedName] || "-"
            };
        });

        setOrders(enrichedOrders);
        } catch (err) {
        console.error("Failed to fetch data:", err);
        }
    };

    fetchOrdersAndCompanies();
    }, []);

    // Save & download in "xlsx" format
    const handleExportToExcel = () => {
      const filteredOrders = orders.filter(
        order => selectedMonth === "" || order.invoice_month?.toLowerCase() === selectedMonth.toLowerCase()
      );

      const dataToExport = filteredOrders.map((order, index) => {
        const hsnList = order.products.map(p => p.hsnNo || "-").join("\n\n");
        const unitList = order.products.map(p => p.unit || "-").join("\n\n");

        return {
          "Sr No": index + 1,
          "Invoice No": order.invoice_no,
          "Invoice Date": order.invoice_date,
          "Invoice Month": order.invoice_month,
          "Company Name": order.company_name,
          "GST No": order.gstNo,
          "HSN Codes": hsnList,
          "Units": unitList,
          "Grand Total": order.grand_total,
          "GST %": order.gst,
          "CGST": order.cgst,
          "SGST": order.sgst,
          "IGST": order.igst,
          "Total Amount": order.sales_amount
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);

      // Ensure newline characters are respected in Excel
      Object.keys(worksheet).forEach(cell => {
        if (worksheet[cell] && typeof worksheet[cell].v === "string" && worksheet[cell].v.includes("\n")) {
          worksheet[cell].s = {
            alignment: { wrapText: true }
          };
        }
      });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array", cellStyles: true });
      const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });

      const filename = selectedMonth
        ? `${selectedMonth}_GSTR-1B.xlsx`
        : "GSTR-1B.xlsx";

      saveAs(fileData, filename);
    };

    // Save & download in "pdf" format
    const handleExportToPDF = () => {
      const filteredOrders = orders.filter(
        order =>
          selectedMonth === '' ||
          order.invoice_month?.toLowerCase() === selectedMonth.toLowerCase()
      );

      const doc = new jsPDF({ orientation: 'landscape' });

      const tableColumn = [
        'Sr No', 'Invoice No', 'Invoice Date', 'Customer', 'GST No',
        'HSN Codes', 'Units', 'Amount', 'GST %', 'CGST', 'SGST', 'IGST', 'Total'
      ];

      const tableRows = filteredOrders.map((order, index) => {
        const hsnList = order.products.map(p => p.hsnNo || '-').join('\n\n');
        const unitList = order.products.map(p => p.unit || '-').join('\n\n');

        return [
          index + 1,
          order.invoice_no,
          order.invoice_date,
          order.company_name,
          order.gstNo || '-',
          hsnList,
          unitList,
          `${order.grand_total}`,
          `${order.gst}`,
          `${order.cgst}`,
          `${order.sgst}`,
          `${order.igst}`,
          `${order.sales_amount}`
        ];
      });

      doc.text('GSTR-1B Orders Report', 14, 15);
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [52, 73, 94] }
      });

      const filename = selectedMonth
        ? `${selectedMonth}_GSTR-1B.pdf`
        : 'GSTR-1B.pdf';

      doc.save(filename);
    };

  return (
    <div className="container mt-4">

      {/* MONTH FILTER */}
      <div className="mb-3">
        <label htmlFor="monthFilter" className="text-white me-2">Filter by Month:</label>
        <select
          id="monthFilter"
          className="form-select mt-1 mb-4"
          style={{ maxWidth: "300px" }}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">All Months</option>
          {Array.from(new Set(orders.map(order => order.invoice_month)))
            .filter(Boolean)
            .map((month, idx) => (
              <option key={idx} value={month}>{month}</option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="scroll-container glow-table mb-5" style={{ borderRadius: "15px", overflow: "auto", whiteSpace: "nowrap", scrollbarColor: "white transparent", maxHeight: "600px" }}>
        <table className="table table-bordered table-striped" style={{ border: "1px solid grey" }}>
          <thead className="table-secondary">
            <tr>
              <th className="text-center">Customer</th>
              <th className="text-center">Invoice No.</th>
              <th className="text-center">Invoice Date</th>
              <th className="text-center">Payment Type</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.filter(order => selectedMonth === "" || order.invoice_month?.toLowerCase() === selectedMonth.toLowerCase()).map((order, index) => (
                <tr key={index} style={order.cancelled ? { opacity: 0.5, textDecoration: "line-through", textDecorationColor: "#FF073A" } : {}}>
                  <td className="table-dark text-center">{order.company_name}</td>
                  <td className="table-dark text-center">{order.invoice_no}</td>
                  <td className="table-dark text-center">{order.invoice_date}</td>
                  <td className="table-dark text-center">{order.payment_type}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center bg-dark text-light">No Orders Found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="text-center mb-5">
        <button
          className="btn btn-primary glow-button glow-table"
          onClick={handleExportToExcel}
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
          Save to Excel <FontAwesomeIcon icon={faSave} style={{ color: "#74C0FC", marginLeft: "10px", fontSize: "18px" }} />

        </button>

        <button
          className="btn btn-danger glow-button glow-table ms-3"
          onClick={handleExportToPDF}
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
          Save to PDF <FontAwesomeIcon icon={faSave} style={{ color: "#FF6B6B", marginLeft: "10px", fontSize: "18px" }} />
        </button>
      </div>
    </div>
  );
};

export default Ledger;
