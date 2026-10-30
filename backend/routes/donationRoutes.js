const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
  createDonation,
  getMyDonations,
  getAvailableDonations,
  acceptDonation,
  getMyPickups,
  markPickupCollected,
  completePickup,
  getCompletedPickups,
  rateDonor,
  withdrawDonation,
  getDonationHistory,
} = require("../controllers/donationController");

router.post("/", verifyToken, createDonation);
router.get("/my", verifyToken, getMyDonations);
router.get("/available", verifyToken, getAvailableDonations);
router.patch("/:id/accept", verifyToken, acceptDonation);
router.get("/my-pickups", verifyToken, getMyPickups);
router.patch("/:id/pickup", verifyToken, markPickupCollected);
router.patch("/:id/complete", verifyToken, completePickup);
router.get("/completed-pickups", verifyToken, getCompletedPickups);
router.post("/:id/rating", verifyToken, rateDonor);
router.put("/withdraw/:id", verifyToken, withdrawDonation);
router.get("/history", verifyToken, getDonationHistory);

module.exports = router;
