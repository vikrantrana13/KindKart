const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "vikrantrana",
  database: process.env.DB_NAME || "kindkart",
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
});

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(results);
    });
  });

const ensureSchema = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      phone VARCHAR(20) NULL,
      email_verified TINYINT(1) NOT NULL DEFAULT 0,
      phone_verified TINYINT(1) NOT NULL DEFAULT 0,
      aadhaar_card LONGTEXT NULL,
      ngo_verification_status VARCHAR(20) NULL,
      ngo_verification_method VARCHAR(30) NULL,
      ngo_verification_document LONGTEXT NULL,
      reviewed_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS otp_verifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      channel VARCHAR(20) NOT NULL,
      identifier VARCHAR(255) NOT NULL,
      purpose VARCHAR(50) NOT NULL,
      otp_code VARCHAR(10) NOT NULL,
      expires_at DATETIME NOT NULL,
      verified_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_otp_target (channel, identifier, purpose)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS donations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      donor_id INT NOT NULL,
      ngo_id INT NULL,
      donation_photos LONGTEXT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      assigned_at DATETIME NULL,
      completed_at DATETIME NULL,
      donor_rating TINYINT NULL,
      donor_rating_at DATETIME NULL,
      FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (ngo_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS pickups (
      id INT AUTO_INCREMENT PRIMARY KEY,
      donation_id INT NOT NULL,
      address TEXT NULL,
      city VARCHAR(255) NULL,
      state VARCHAR(255) NULL,
      pincode VARCHAR(20) NULL,
      landmark VARCHAR(255) NULL,
      place_id VARCHAR(255) NULL,
      latitude DECIMAL(10,7) NULL,
      longitude DECIMAL(10,7) NULL,
      pickup_date DATE NULL,
      time_slot VARCHAR(50) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS donation_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      donation_id INT NOT NULL,
      category VARCHAR(50) NULL,
      item_name VARCHAR(255) NOT NULL,
      quantity VARCHAR(50) NOT NULL,
      unit VARCHAR(50) NULL,
      item_condition VARCHAR(100) NULL,
      food_type VARCHAR(50) NULL,
      food_condition VARCHAR(100) NULL,
      prepared_time VARCHAR(100) NULL,
      expiry_time VARCHAR(100) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE
    )
  `);

  const alterStatements = [
    "ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL",
    "ALTER TABLE users ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0",
    "ALTER TABLE users ADD COLUMN phone_verified TINYINT(1) NOT NULL DEFAULT 0",
    "ALTER TABLE users ADD COLUMN aadhaar_card LONGTEXT NULL",
    "ALTER TABLE users ADD COLUMN ngo_verification_status VARCHAR(20) NULL",
    "ALTER TABLE users ADD COLUMN ngo_verification_method VARCHAR(30) NULL",
    "ALTER TABLE users ADD COLUMN ngo_verification_document LONGTEXT NULL",
    "ALTER TABLE users ADD COLUMN reviewed_at DATETIME NULL",
    "ALTER TABLE users ADD COLUMN specialization VARCHAR(255) NULL",
    "ALTER TABLE users ADD COLUMN service_city VARCHAR(255) NULL",
    "ALTER TABLE users ADD COLUMN service_pincode VARCHAR(255) NULL",
    "ALTER TABLE users ADD COLUMN categories_accepted TEXT NULL",
    "ALTER TABLE users ADD COLUMN description TEXT NULL",
    "ALTER TABLE users ADD COLUMN logo_data_url LONGTEXT NULL",
    "ALTER TABLE pickups ADD COLUMN place_id VARCHAR(255) NULL",
    "ALTER TABLE pickups ADD COLUMN latitude DECIMAL(10,7) NULL",
    "ALTER TABLE pickups ADD COLUMN longitude DECIMAL(10,7) NULL",
    "ALTER TABLE donations ADD COLUMN ngo_id INT NULL",
    "ALTER TABLE donations ADD COLUMN donation_photos LONGTEXT NULL",
    "ALTER TABLE donations ADD COLUMN assigned_at DATETIME NULL",
    "ALTER TABLE donations ADD COLUMN completed_at DATETIME NULL",
    "ALTER TABLE donations ADD COLUMN donor_rating TINYINT NULL",
    "ALTER TABLE donations ADD COLUMN donor_rating_at DATETIME NULL",
    "ALTER TABLE donation_items ADD COLUMN category VARCHAR(50) NULL",
    "ALTER TABLE donation_items ADD COLUMN item_condition VARCHAR(100) NULL"
  ];

  for (const sql of alterStatements) {
    try {
      await query(sql);
    } catch (error) {
      if (error.code !== "ER_DUP_FIELDNAME") {
        throw error;
      }
    }
  }

  await query(`
    UPDATE users
    SET
      email_verified = CASE WHEN role IN ('donor', 'ngo') THEN 1 ELSE email_verified END,
      phone_verified = CASE WHEN role IN ('donor', 'ngo') THEN 1 ELSE phone_verified END,
      ngo_verification_status = CASE WHEN role = 'ngo' THEN 'approved' ELSE ngo_verification_status END,
      ngo_verification_method = CASE
        WHEN role = 'ngo' AND ngo_verification_document IS NOT NULL AND ngo_verification_document <> '' THEN 'document'
        WHEN role = 'ngo' THEN 'contact'
        ELSE ngo_verification_method
      END,
      reviewed_at = CASE WHEN role = 'ngo' THEN NULL ELSE reviewed_at END
    WHERE role IN ('donor', 'ngo')
  `);

  await query(`
    DELETE FROM otp_verifications
    WHERE expires_at < NOW()
  `);
};

(async () => {
  try {
    await query("SELECT 1");
    console.log("MySQL pool ready");
    await ensureSchema();
    console.log("Database schema ready");
  } catch (error) {
    console.error("Database setup failed", error);
  }
})();

db.queryAsync = query;

module.exports = db;
