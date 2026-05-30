const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const pool = require("./db/pool");
const initDb = require("./db/initDb");
const authRoutes = require("./routes/authRoutes");
const decksRoutes = require("./routes/decksRoutes");
const publicDecksRoutes = require("./routes/publicDecksRoutes");

const app = express();

const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
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
    environment: process.env.NODE_ENV || "development",
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

if (isProduction) {
  const clientDistPath = path.join(__dirname, "../public");

  app.use(express.static(clientDistPath));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

async function startServer() {
  try {
    if (process.env.RUN_DB_INIT === "true") {
      await initDb();
    }

    app.listen(PORT, () => {
      console.log(`QuickCards API is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();