const db = require("../config/db");

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};

const requireApprovedNgo = async (req, res, next) => {
  if (req.user.role !== "ngo") {
    return res.status(403).json({ message: "NGO access required" });
  }

  try {
    const rows = await db.queryAsync(
      "SELECT ngo_verification_status FROM users WHERE id = ? LIMIT 1",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const status = rows[0].ngo_verification_status || "pending";

    if (status !== "approved") {
      return res.status(403).json({
        message:
          status === "rejected"
            ? "Your NGO account was rejected by admin. Update your profile and contact support."
            : "Your NGO account is pending admin approval.",
        ngoVerificationStatus: status,
      });
    }

    next();
  } catch (error) {
    console.error("NGO approval middleware error:", error);
    res.status(500).json({ message: "Unable to verify NGO approval status" });
  }
};

module.exports = {
  requireAdmin,
  requireApprovedNgo,
};
