const db = require("../config/db");

const serializeNgo = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  specialization: user.specialization || "",
  serviceCity: user.service_city || "",
  servicePincode: user.service_pincode || "",
  ngoVerificationStatus: user.ngo_verification_status || "pending",
  reviewedAt: user.reviewed_at || null,
  createdAt: user.created_at,
});

exports.getNgoApprovals = async (req, res) => {
  const { status = "all" } = req.query;

  try {
    let sql = "SELECT * FROM users WHERE role = 'ngo'";
    const params = [];

    if (status !== "all") {
      sql += " AND ngo_verification_status = ?";
      params.push(status);
    }

    sql += " ORDER BY created_at DESC";

    const rows = await db.queryAsync(sql, params);
    res.json(rows.map(serializeNgo));
  } catch (error) {
    console.error("Fetch NGO approvals error:", error);
    res.status(500).json({ message: "Unable to fetch NGO approvals" });
  }
};

exports.updateNgoApproval = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid NGO approval status" });
  }

  try {
    const result = await db.queryAsync(
      `
        UPDATE users
        SET ngo_verification_status = ?, reviewed_at = NOW()
        WHERE id = ? AND role = 'ngo'
      `,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "NGO account not found" });
    }

    const rows = await db.queryAsync(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [id]
    );

    res.json({
      message: `NGO status updated to ${status}`,
      ngo: serializeNgo(rows[0]),
    });
  } catch (error) {
    console.error("Update NGO approval error:", error);
    res.status(500).json({ message: "Unable to update NGO approval status" });
  }
};
