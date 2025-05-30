import React, { useEffect, useState } from "react";
import OrdersTable from "../components/OrdersTable";
import { Modal } from 'react-bootstrap';
import {
  BarChart,
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const Growth = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [chartType, setChartType] = useState("bar");
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [profitValue, setProfitValue] = useState(0);
  const [profitPercent, setProfitPercent] = useState(0);
  const [profitData, setProfitData] = useState([]);
  const [showOrdersModal, setShowOrdersModal] = useState(false);

  // Handle screen resizing
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordersRes = await fetch("http://localhost:5000/api/orders");
        const ordersData = await ordersRes.json();
        const purchasesRes = await fetch("http://localhost:5000/api/purchases");
        const purchasesData = await purchasesRes.json();
  
        const activeOrders = ordersData.filter(order => !order.cancelled);
  
        const orderCounts = {};
        const revenueTotals = {};
        const purchaseCounts = {};
  
        months.forEach(month => {
          orderCounts[month] = 0;
          revenueTotals[month] = 0;
          purchaseCounts[month] = 0;
        });
  
        activeOrders.forEach(order => {
          const month = order.invoice_month;
          if (month in orderCounts) {
            orderCounts[month]++;
            revenueTotals[month] += parseFloat(order.sales_amount || 0);
          }
        });
  
        purchasesData.forEach(purchase => {
          const month = purchase.invoice_month;
          if (month in purchaseCounts) {
            purchaseCounts[month]++; // 🆕 count purchase
          }
        });
  
        const chartData = months.map(month => ({
          month,
          orders: orderCounts[month],
          revenue: parseFloat(revenueTotals[month].toFixed(2)),
          purchase: purchaseCounts[month], // 🆕 Include purchase
        }));
  
        setMonthlyData(chartData);
  
        // Profit Calculation (same as before)
        const totalOrderRevenue = activeOrders.reduce((sum, o) => sum + parseFloat(o.sales_amount || 0), 0);
        const totalPurchaseCost = purchasesData.reduce((sum, p) => sum + parseFloat(p.sales_amount || 0), 0);
  
        const profit = totalOrderRevenue - totalPurchaseCost;
        const profitRatio = totalOrderRevenue > 0 ? (profit / totalOrderRevenue) * 100 : 0;
  
        setProfitValue(profit);
        setProfitPercent(profitRatio);
  
        setProfitData([
          { name: "Revenue", value: totalOrderRevenue },
          { name: "Purchase", value: totalPurchaseCost }
        ]);
  
      } catch (error) {
        console.error("Failed to fetch orders or purchases:", error);
      }
    };
  
    fetchData();
  }, []);      

  return (
    <div className="container-fluid mt-5 px-2 px-sm-4">
      {/* <OrdersTable /> */}

      <div className="text-center mb-5">
        <button
          className="btn btn-primary glow-button glow-table"
          style={{
            animation: "fadeSlideUp 1.5s ease-out",
            background: "transparent",
            color: "#fff",
            padding: "12px 24px",
            fontWeight: "600",
            fontSize: "16px",
            cursor: "pointer"
          }}
          onClick={() => setShowOrdersModal(true)}
        >
          GSTR-1B
        </button>
      </div>

      <Modal
        show={showOrdersModal}
        onHide={() => setShowOrdersModal(false)}
        size="xl"
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton style={{ backgroundColor: "#1c1c1c", color: "#fff" }}>
          <div className="w-100 text-center">
            <Modal.Title>GSTR-1B</Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#1c1c1c" }}>
          <OrdersTable />
        </Modal.Body>
      </Modal>

      <h2 className="text-center mb-4 text-white" style={{ marginTop: "150px", fontFamily: "DM Serif Text, serif", animation: "fadeSlideUp 1.5s ease-out" }}>
        Monthly Growth
      </h2>
      {/* Toggle Switch Right-Aligned */}
      <div className="d-flex justify-content-end mb-3">
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="chartTypeSwitch"
            checked={chartType === "line"}
            onChange={() => setChartType(prev => (prev === "bar" ? "line" : "bar"))}
            style={{ cursor: "pointer", transform: "scale(1.3)" }}
          />
          <label
            className="form-check-label ms-2 text-white"
            htmlFor="chartTypeSwitch"
            style={{ fontSize: screenWidth < 400 ? "0.95rem" : "1.1rem" }}
          >
            Change View
          </label>
        </div>
      </div>

      {/* Chart Container */}
      <div style={{ width: "100%", overflowX: "auto" }}>
        <ResponsiveContainer width="100%" height={400}>
          {chartType === "bar" ? (
            <BarChart
            data={monthlyData}
            margin={{ top: 30, right: 30, left: 10, bottom: 40 }}
            barCategoryGap="30%"
            barGap={5}
          >
            <XAxis
              dataKey="month"
              interval={0}
              angle={screenWidth < 500 ? -90 : -30}
              textAnchor="end"
              height={screenWidth < 500 ? 120 : 80}
              stroke="#ffffff"
              tick={{ fill: "#ffffff", fontSize: screenWidth < 500 ? 10 : 12 }}
            />
          
            {/* Left Y Axis for Orders */}
            <YAxis
              yAxisId="left"
              allowDecimals={false}
              stroke="#ffffff"
              tick={{ fill: "#ffffff", fontSize: 12 }}
            />
          
            {/* Right Y Axis for Revenue */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#ffffff"
              tick={{ fill: "#ffffff", fontSize: 12 }}
            />
          
            <Tooltip
              contentStyle={{ backgroundColor: "#222", border: "none" }}
              itemStyle={{ color: "#fff" }}
              labelStyle={{ color: "#fff" }}
            />
          
            {/* Orders bar linked to left Y Axis */}
            <Bar
              yAxisId="left"
              dataKey="orders"
              fill="#8884d8"
              radius={[6, 6, 0, 0]}
              animationDuration={1500}
            />
          
            {/* Revenue bar linked to right Y Axis */}
            <Bar
              yAxisId="right"
              dataKey="revenue"
              fill="#ffc658"
              radius={[6, 6, 0, 0]}
              animationDuration={1500}
            />

            {/* Purchase bar linked to left Y Axis */}
            <Bar
              yAxisId="left"
              dataKey="purchase"
              fill="#ff7f7f" // Light Red color
              radius={[6, 6, 0, 0]}
              animationDuration={1500}
            />
          </BarChart>                    
          ) : (
            <LineChart
              data={monthlyData}
              margin={{ top: 30, right: 30, left: 10, bottom: 40 }}
            >
              <XAxis
                dataKey="month"
                interval={0}
                angle={screenWidth < 500 ? -90 : -30}
                textAnchor="end"
                height={screenWidth < 500 ? 120 : 80}
                stroke="#ffffff"
                tick={{
                  fill: "#ffffff",
                  fontSize: screenWidth < 500 ? 10 : 12,
                }}
              />

              {/* Left Y Axis for Orders */}
              <YAxis
                yAxisId="left"
                allowDecimals={false}
                stroke="#ffffff"
                tick={{ fill: "#ffffff", fontSize: 12 }}
              />

              {/* Right Y Axis for Revenue */}
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#ffffff"
                tick={{ fill: "#ffffff", fontSize: 12 }}
              />

              <Tooltip
                contentStyle={{ backgroundColor: "#222", border: "none" }}
                itemStyle={{ color: "#fff" }}
                labelStyle={{ color: "#fff" }}
              />

              {/* Orders line linked to left axis */}
              <Line
                type="monotone"
                yAxisId="left"
                dataKey="orders"
                stroke="#82ca9d"
                strokeWidth={3}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />

              {/* Revenue line linked to right axis */}
              <Line
                type="monotone"
                yAxisId="right"
                dataKey="revenue"
                stroke="#ffa500"
                strokeWidth={3}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />

              <Line
                type="monotone"
                yAxisId="left"
                dataKey="purchase"
                stroke="#ff7f7f"
                strokeWidth={3}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </LineChart>
          )}
        </ResponsiveContainer>

        {/* Legends Here */}
        <div className="d-flex justify-content-center">
          <div style={{ display: "flex", alignItems: "center", marginRight: "20px" }}>
            <div
              style={{
                width: "20px",
                height: "10px",
                backgroundColor: chartType === "bar" ? "#8884d8" : "#82ca9d", // 🔵 🟢
                marginRight: "8px",
                borderRadius: "2px",
              }}
            ></div>
            <span style={{ color: "white", fontSize: "14px" }}>Orders</span>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "20px",
                height: "10px",
                backgroundColor: chartType === "bar" ? "#ffc658" : "#ffa500", // 🟡 🟠
                marginRight: "8px",
                borderRadius: "2px",
              }}
            ></div>
            <span style={{ color: "white", fontSize: "14px" }}>Revenue</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", marginLeft: "20px" }}>
            <div
              style={{
                width: "20px",
                height: "10px",
                backgroundColor: "#ff7f7f", // Red for purchase
                marginRight: "8px",
                borderRadius: "2px",
              }}
            ></div>
            <span style={{ color: "white", fontSize: "14px" }}>Purchase</span>
          </div>
        </div>
      </div>

      <h2 className="text-center mb-4 text-white"
        style={{ fontFamily: "DM Serif Text, serif", animation: "fadeSlideUp 1.5s ease-out", marginTop: "200px" }}>
        Total Profit
      </h2>
      <div className="position-relative d-flex justify-content-center mb-5">
        <PieChart width={300} height={300}>
          <Pie
            data={profitData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={100}
            outerRadius={130}
            startAngle={90}
            endAngle={-270}
            paddingAngle={2}
            labelLine={false}
            isAnimationActive={true}
          >
            <Cell fill="#82ca9d" /> {/* Revenue */}
            <Cell fill="#8884d8" /> {/* Purchase */}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`₹${value.toFixed(2)}`, name]}
            contentStyle={{ backgroundColor: "#222", border: "none", borderRadius: "5px" }}
            itemStyle={{ color: "#fff" }}
            labelStyle={{ color: "#fff" }}
          />
        </PieChart>

        {/* Center content inside the chart */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "white",
          textAlign: "center",
          fontSize: "1.1rem",
          fontWeight: "600",
          pointerEvents: "none"
        }}>
          <div style={{ color: profitValue >= 0 ? "#4CAF50" : "red", fontSize: "20px", fontWeight: "bold" }}>
            {profitValue >= 0 ? "Profit 🔺" : "Loss 🔻"}
          </div>
          <div>₹{profitValue.toFixed(2)}</div>
          <div style={{ fontSize: "0.9rem", color: "#aaa" }}>
            {profitPercent.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default Growth;
