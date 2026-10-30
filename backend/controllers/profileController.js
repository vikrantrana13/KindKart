const bcrypt = require("bcryptjs");
const db = require("../config/db");

const parseCategories = (value) => {
  if (!value) {
    return [];
  }

  try {
    return JSON.parse(value);
  } catch (_error) {
    return [];
  }
};

const serializeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  role: user.role,
  ngoVerificationStatus: user.ngo_verification_status || null,
  ngoVerificationMethod: user.ngo_verification_method || null,
  ngoVerificationDocumentUploaded: Boolean(user.ngo_verification_document),
  specialization: user.specialization || "",
  serviceCity: user.service_city || "",
  servicePincode: user.service_pincode || "",
  categoriesAccepted: parseCategories(user.categories_accepted),
  description: user.description || "",
  logoDataUrl: user.logo_data_url || "",
});

exports.getMyProfile = async (req, res) => {
  try {
    const rows = await db.queryAsync(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(serializeUser(rows[0]));
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Unable to fetch profile" });
  }
};

exports.updateMyProfile = async (req, res) => {
  const {
    name,
    email,
    phone,
    specialization,
    serviceCity,
    servicePincode,
    categoriesAccepted,
    description,
    logoDataUrl,
    ngoVerificationDocument,
  } = req.body;

  const providedNgoDocument =
    typeof ngoVerificationDocument === "string" ? ngoVerificationDocument : null;

  try {
    await db.queryAsync(
      `
        UPDATE users
        SET
          name = ?,
          email = ?,
          phone = ?,
          specialization = ?,
          service_city = ?,
          service_pincode = ?,
          categories_accepted = ?,
          description = ?,
          logo_data_url = ?,
          ngo_verification_document = CASE
            WHEN role = 'ngo' AND ? IS NOT NULL THEN ?
            ELSE ngo_verification_document
          END,
          ngo_verification_method = CASE
            WHEN role = 'ngo' AND ? IS NOT NULL AND ? <> '' THEN 'document'
            WHEN role = 'ngo' AND ngo_verification_document IS NOT NULL AND ngo_verification_document <> '' THEN 'document'
            WHEN role = 'ngo' THEN 'contact'
            ELSE ngo_verification_method
          END,
          ngo_verification_status = CASE WHEN role = 'ngo' THEN 'approved' ELSE ngo_verification_status END,
          reviewed_at = CASE WHEN role = 'ngo' THEN NULL ELSE reviewed_at END
        WHERE id = ?
      `,
      [
        name || "",
        email || "",
        phone || null,
        specialization || null,
        serviceCity || null,
        servicePincode || null,
        JSON.stringify(categoriesAccepted || []),
        description || null,
        logoDataUrl || null,
        providedNgoDocument,
        providedNgoDocument,
        providedNgoDocument,
        providedNgoDocument,
        req.user.id,
      ]
    );

    const rows = await db.queryAsync(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [req.user.id]
    );

    res.json({
      message: "Profile updated successfully",
      user: serializeUser(rows[0]),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Unable to update profile" });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current and new passwords are required" });
  }

  try {
    const rows = await db.queryAsync(
      "SELECT password FROM users WHERE id = ? LIMIT 1",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.queryAsync("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      req.user.id,
    ]);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Unable to update password" });
  }
};
