const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const {
  getMyProfile,
  updateMyProfile,
  changePassword,
} = require("../controllers/profileController");

router.get("/me", verifyToken, getMyProfile);
router.put("/me", verifyToken, updateMyProfile);
router.put("/password", verifyToken, changePassword);

module.exports = router;
