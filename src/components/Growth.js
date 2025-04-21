import React, { useEffect, useState } from "react";
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

  //TESTING
  const [profitValue, setProfitValue] = useState(0);
  const [profitPercent, setProfitPercent] = useState(0);
  const [profitData, setProfitData] = useState([]);

  // Handle screen resizing
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch data
  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    const activeOrders = orders.filter(order => !order.cancelled);
  
    const orderCounts = {};
    const revenueTotals = {};
  
    months.forEach(month => {
      orderCounts[month] = 0;
      revenueTotals[month] = 0;
    });
  
    activeOrders.forEach(order => {
      const month = order.invoiceMonth;
      if (month in orderCounts) {
        orderCounts[month]++;
        revenueTotals[month] += parseFloat(order.salesAmount || 0);
      }
    });
  
    const chartData = months.map(month => ({
      month,
      orders: orderCounts[month],
      revenue: parseFloat(revenueTotals[month].toFixed(2)),
    }));
  
    setMonthlyData(chartData);

    //TESTING
    const totalOrderRevenue = activeOrders.reduce((sum, o) => sum + parseFloat(o.salesAmount || 0), 0);

    const purchases = JSON.parse(localStorage.getItem("purchase")) || [];
    const totalPurchaseCost = purchases.reduce((sum, p) => sum + parseFloat(p.salesAmount || 0), 0);

    const profit = totalOrderRevenue - totalPurchaseCost;
    const profitRatio = totalOrderRevenue > 0 ? (profit / totalOrderRevenue) * 100 : 0;

    setProfitValue(profit);
    setProfitPercent(profitRatio);

    setProfitData([
      { name: "Revenue", value: totalOrderRevenue },
      { name: "Purchase", value: totalPurchaseCost }
    ])
  }, []);  

  return (
    <div className="container-fluid mt-5 px-2 px-sm-4">
      <h2 className="text-center mb-4 text-white"
        style={{ fontFamily: "DM Serif Text, serif", animation: "fadeSlideUp 1.5s ease-out" }}>
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
      <Cell fill="#ffc658" /> {/* Revenue */}
      <Cell fill="crimson" /> {/* Purchase */}
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
    <div>Profit</div>
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
