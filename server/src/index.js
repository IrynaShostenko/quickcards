const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db/pool");
const decksRoutes = require("./routes/decksRoutes");

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_URL,
  }),
);

app.use(express.json());

app.use("/api/decks", decksRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "quickcards-api",
  });
});

app.get("/api/health/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");

    res.json({
      status: "ok",
      database: "connected",
      currentTime: result.rows[0].current_time,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      database: "not connected",
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`QuickCards API is running on port ${PORT}`);
});