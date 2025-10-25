const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../../middleware/jwtAuth");

// Import all admin routes
const auth = require("./auth");
const routes = require("./routes");
const consumers = require("./consumers");
const apiKeys = require("./apiKeys");
const ipRules = require("./ipRules");
const geoRules = require("./geoRules");
const botRules = require("./botRules");
const transformations = require("./transformations");
const terminationRules = require("./terminationRules");
const logs = require("./logs");
const projects = require("./projects");

// Public auth routes (no authentication required)
// Debug logging for auth routes
router.use("/auth", (req, res, next) => {
  console.log(`[DEBUG] Auth route accessed: ${req.method} ${req.path}`);
  next();
});
router.use("/auth", auth);

// Protected admin routes (JWT authentication required)
router.use("/routes", routes);
router.use("/consumers", authenticateJWT, consumers);
router.use("/api-keys", authenticateJWT, apiKeys);
router.use("/ip-rules", authenticateJWT, ipRules);
router.use("/geo-rules", authenticateJWT, geoRules);
router.use("/bot-rules", authenticateJWT, botRules);
router.use("/transformations", authenticateJWT, transformations);
router.use("/termination-rules", authenticateJWT, terminationRules);
router.use("/logs", authenticateJWT, logs);
router.use("/projects", authenticateJWT, projects);

module.exports = router;
