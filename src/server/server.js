// src/server/server.js
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const companyRoutes = require("./routes");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", companyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
