console.log("📦 dashboard.js loaded");

const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const { getDashboardData } = require("../controllers/dashboardController");

router.get("/", (req, res, next) => {
  console.log("📍 GET /api/dashboard hit");
  next();
}, auth, getDashboardData);

module.exports = router;
