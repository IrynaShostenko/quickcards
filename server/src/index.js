const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const pool = require("./db/pool");
const authRoutes = require("./routes/authRoutes");
const decksRoutes = require("./routes/decksRoutes");
const publicDecksRoutes = require("./routes/publicDecksRoutes");

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_URL,
  }),
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/decks", decksRoutes);
app.use("/api/public", publicDecksRoutes);

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

if (process.env.NODE_ENV === "production") {
  const clientDistPath = path.join(__dirname, "../../client/dist");

  app.use(express.static(clientDistPath));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`QuickCards API is running on port ${PORT}`);
});
