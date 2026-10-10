require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const connectDB = require("./src/config/database");
const { connectRedis } = require("./src/config/redis");
const logger = require("./src/utils/logger");
const correlationIdMiddleware = require("./src/middleware/correlationId");
const requestLoggerMiddleware = require("./src/middleware/requestLogger");

// Routes
const gatewayRoutes = require("./src/routes/gateway");
const adminRoutes = require("./src/routes/admin");

const app = express();

// CORS configuration - must be before other middleware
const corsOrigins = process.env.CORS_ORIGIN || "http://localhost:3000,http://localhost:5173";
const allowedOrigins = corsOrigins
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      const allowAll = allowedOrigins.includes("*");

      if (!origin || allowAll || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error(`Origin ${origin} not allowed by CORS configuration`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);

// Explicitly handle OPTIONS requests
app.options("*", (req, res) => {
  res.sendStatus(200);
});

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
  })
);
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: process.env.MAX_REQUEST_SIZE || "10mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: process.env.MAX_REQUEST_SIZE || "10mb",
  })
);

// Correlation ID middleware (must be before request logger)
app.use(correlationIdMiddleware);

// Request logging
app.use(requestLoggerMiddleware);

// Morgan HTTP logging
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    correlationId: req.correlationId,
  });
});

// Metrics endpoint (enhanced implementation)
const metricsService = require("./src/services/metricsService");

app.get("/metrics", async (req, res) => {
  try {
    const format = req.query.format || "json";

    if (format === "prometheus") {
      const prometheusMetrics = await metricsService.getPrometheusMetrics();
      res.set("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
      res.send(prometheusMetrics);
    } else {
      const jsonMetrics = await metricsService.getJsonMetrics();
      res.json(jsonMetrics);
    }
  } catch (error) {
    logger.error("Metrics endpoint error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to retrieve metrics",
      correlationId: req.correlationId,
    });
  }
});

// Admin API routes (must be before gateway routes to avoid wildcard catch)
// Debug logging for admin routes
app.use("/api/admin", (req, res, next) => {
  console.log(`[DEBUG] Incoming request to: ${req.method} ${req.path}`);
  next();
});
app.use("/api/admin", adminRoutes);

// Gateway routes (wildcard - must be last)
app.use("/", gatewayRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`,
    correlationId: req.correlationId,
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error("Error:", {
    error: err.message,
    stack: err.stack,
    correlationId: req.correlationId,
  });

  res.status(err.status || 500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "An error occurred",
    correlationId: req.correlationId,
  });
});

// Use environment PORT or default to 8080 for API Gateway
const PORT = process.env.PORT || 8080;

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to Redis (optional)
    // await connectRedis();

    // Start server
    app.listen(PORT, () => {
      logger.info(`API Gateway running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
