const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/accessMiddleware");
const {
  getNgoApprovals,
  updateNgoApproval,
} = require("../controllers/adminController");

router.get("/ngos", verifyToken, requireAdmin, getNgoApprovals);
router.patch("/ngos/:id/status", verifyToken, requireAdmin, updateNgoApproval);

module.exports = router;
