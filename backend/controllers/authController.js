const db = require('../config/db');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const { sendOtpMessage } = require('../services/otpDeliveryService');

const OTP_TTL_MINUTES = 10;

const buildAuthResponse = (user) => ({
  token: generateToken(user),
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    emailVerified: Boolean(user.email_verified),
    phoneVerified: Boolean(user.phone_verified),
    aadhaarSubmitted: Boolean(user.aadhaar_card),
    ngoVerificationStatus: user.ngo_verification_status || null,
    ngoVerificationMethod: user.ngo_verification_method || null,
    ngoVerificationDocumentUploaded: Boolean(user.ngo_verification_document),
  },
});

const isValidOtpChannel = (channel) => channel === 'email' || channel === 'phone';
const normalizePurpose = () => 'register';
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const getExpirySql = () => 'DATE_ADD(NOW(), INTERVAL ' + OTP_TTL_MINUTES + ' MINUTE)';

const getOtpDeliveryErrorMessage = (error) => {
  const debugCode = error && error.code ? ` (${error.code})` : '';
  return (error.message || 'Unable to request OTP') + debugCode;
};

const saveOtpRecord = async (channel, value, purpose, otp) => {
  await db.queryAsync(
    `
      INSERT INTO otp_verifications (channel, identifier, purpose, otp_code, expires_at, verified_at)
      VALUES (?, ?, ?, ?, ${getExpirySql()}, NULL)
      ON DUPLICATE KEY UPDATE
        otp_code = VALUES(otp_code),
        expires_at = VALUES(expires_at),
        verified_at = NULL,
        updated_at = CURRENT_TIMESTAMP
    `,
    [channel, value, purpose, otp]
  );
};

const sendOtpDeliveryInBackground = (channel, value, otp) => {
  Promise.resolve()
    .then(() => sendOtpMessage(channel, value, otp))
    .catch((error) => {
      console.error('Send OTP delivery error:', error);
    });
};

const getVerificationRecord = async (channel, value, purpose) => {
  const rows = await db.queryAsync(
    `
      SELECT *
      FROM otp_verifications
      WHERE channel = ? AND identifier = ? AND purpose = ?
      ORDER BY id DESC
      LIMIT 1
    `,
    [channel, value, purpose]
  );

  return rows[0] || null;
};

const getVerificationTargetValue = (channel, email, phone) => {
  return channel === 'email' ? email : phone;
};

const requireVerifiedContactForRegistration = async (verificationChannel, email, phone) => {
  if (!isValidOtpChannel(verificationChannel)) {
    return 'Choose email or phone verification before registration';
  }

  const targetValue = getVerificationTargetValue(verificationChannel, email, phone);
  const verificationRecord = await getVerificationRecord(verificationChannel, targetValue, 'register');

  if (!verificationRecord || !verificationRecord.verified_at) {
    return verificationChannel === 'email'
      ? 'Email OTP verification is required before registration'
      : 'Phone OTP verification is required before registration';
  }

  return null;
};

exports.sendOtp = async (req, res) => {
  const { channel, value, purpose } = req.body;

  if (!isValidOtpChannel(channel) || !value) {
    return res.status(400).json({ message: 'Channel and value are required' });
  }

  const normalizedPurpose = normalizePurpose(purpose);
  const otp = generateOtp();

  try {
    await saveOtpRecord(channel, value, normalizedPurpose, otp);
    sendOtpDeliveryInBackground(channel, value, otp);

    res.json({
      message: channel === 'email' ? 'OTP requested for your email address' : 'OTP requested for your phone number',
      expiresInMinutes: OTP_TTL_MINUTES,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: getOtpDeliveryErrorMessage(error) });
  }
};

exports.verifyOtp = async (req, res) => {
  const { channel, value, otp, purpose } = req.body;

  if (!isValidOtpChannel(channel) || !value || !otp) {
    return res.status(400).json({ message: 'Channel, value, and OTP are required' });
  }

  const normalizedPurpose = normalizePurpose(purpose);

  try {
    const record = await getVerificationRecord(channel, value, normalizedPurpose);

    if (!record) {
      return res.status(404).json({ message: 'No OTP request found' });
    }

    if (record.verified_at) {
      return res.json({ message: channel + ' already verified' });
    }

    if (String(record.otp_code) !== String(otp)) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const expiresAt = new Date(record.expires_at).getTime();
    if (Date.now() > expiresAt) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    await db.queryAsync(
      `
        UPDATE otp_verifications
        SET verified_at = NOW(), updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [record.id]
    );

    res.json({ message: channel + ' verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    const debugCode = error && error.code ? ` (${error.code})` : '';
    res.status(500).json({ message: 'Unable to verify OTP' + debugCode });
  }
};

exports.registerUser = async (req, res) => {
  const { name, email, password, role, phone, aadhaarCard, ngoVerificationDocument, verificationChannel } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Missing required registration fields' });
  }

  if ((role === 'donor' || role === 'ngo') && !phone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  if ((role === 'donor' || role === 'ngo') && !isValidOtpChannel(verificationChannel)) {
    return res.status(400).json({ message: 'Select email or phone verification' });
  }

  if (role === 'donor' && !aadhaarCard) {
    return res.status(400).json({ message: 'Aadhaar card is required for donor registration' });
  }

  try {
    const existingUsers = await db.queryAsync('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    if (role === 'donor' || role === 'ngo') {
      const verificationError = await requireVerifiedContactForRegistration(verificationChannel, email, phone);
      if (verificationError) {
        return res.status(400).json({ message: verificationError });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const ngoVerificationStatus = role === 'ngo' ? 'approved' : null;
    const ngoVerificationMethod = role === 'ngo' ? (ngoVerificationDocument ? 'document' : verificationChannel) : null;
    const emailVerified = verificationChannel === 'email' ? 1 : 0;
    const phoneVerified = verificationChannel === 'phone' ? 1 : 0;

    const result = await db.queryAsync(
      `
        INSERT INTO users (
          name,email,password,role,phone,email_verified,phone_verified,aadhaar_card,
          ngo_verification_status,ngo_verification_method,ngo_verification_document
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
      `,
      [
        name,
        email,
        hashedPassword,
        role,
        phone || null,
        emailVerified,
        phoneVerified,
        role === 'donor' ? aadhaarCard : null,
        ngoVerificationStatus,
        ngoVerificationMethod,
        role === 'ngo' ? ngoVerificationDocument || null : null,
      ]
    );

    await db.queryAsync(
      "DELETE FROM otp_verifications WHERE purpose = 'register' AND ((channel = 'email' AND identifier = ?) OR (channel = 'phone' AND identifier = ?))",
      [email, phone || '']
    );

    const createdUser = {
      id: result.insertId,
      name,
      email,
      phone: phone || '',
      role,
      email_verified: emailVerified,
      phone_verified: phoneVerified,
      aadhaar_card: role === 'donor' ? aadhaarCard : null,
      ngo_verification_status: ngoVerificationStatus,
      ngo_verification_method: ngoVerificationMethod,
      ngo_verification_document: role === 'ngo' ? ngoVerificationDocument || null : null,
    };

    const verificationLabel = verificationChannel === 'email' ? 'email OTP' : 'phone OTP';

    res.status(201).json({
      message:
        role === 'ngo'
          ? ngoVerificationMethod === 'document'
            ? 'NGO registered after ' + verificationLabel + ' verification, with document verification stored.'
            : 'NGO registered after ' + verificationLabel + ' verification.'
          : role === 'donor'
            ? 'Donor registered after ' + verificationLabel + ' verification.'
            : 'User registered successfully',
      ...buildAuthResponse(createdUser),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Unable to register user' });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const results = await db.queryAsync('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);

    if (results.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    res.json({
      message:
        user.role === 'ngo'
          ? 'Login successful. Your NGO account is verified and active.'
          : user.role === 'donor'
            ? 'Login successful. Your donor account is verified and active.'
            : 'Login successful',
      ...buildAuthResponse(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Unable to login' });
  }
};
