let cachedMailer = null;
let cachedSmsClient = null;

const getEmailTransport = () => {
  if (cachedMailer) {
    return cachedMailer;
  }

  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch (error) {
    throw new Error('Email OTP is not available because nodemailer is not installed.');
  }

  const smtpService = process.env.SMTP_SERVICE || '';
  const smtpHost = process.env.SMTP_HOST || '';
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER || '';
  const smtpPass = process.env.SMTP_PASS || '';
  const smtpSecure =
    process.env.SMTP_SECURE === 'true' || (!process.env.SMTP_SECURE && smtpPort === 465);

  if (!smtpUser || !smtpPass || (!smtpService && !smtpHost)) {
    throw new Error('Email OTP is not configured. Set SMTP_SERVICE or SMTP_HOST with SMTP_USER and SMTP_PASS.');
  }

  const transportConfig = smtpService
    ? {
        service: smtpService,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      }
    : {
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      };

  transportConfig.connectionTimeout = Number(process.env.SMTP_CONNECTION_TIMEOUT || 10000);
  transportConfig.greetingTimeout = Number(process.env.SMTP_GREETING_TIMEOUT || 10000);
  transportConfig.socketTimeout = Number(process.env.SMTP_SOCKET_TIMEOUT || 15000);

  cachedMailer = nodemailer.createTransport(transportConfig);
  return cachedMailer;
};

const getSmsClient = () => {
  if (cachedSmsClient) {
    return cachedSmsClient;
  }

  let twilio;
  try {
    twilio = require('twilio');
  } catch (error) {
    throw new Error('Phone OTP is not available because twilio is not installed.');
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
  const authToken = process.env.TWILIO_AUTH_TOKEN || '';
  const senderNumber = process.env.TWILIO_PHONE_NUMBER || '';

  if (!accountSid || !authToken || !senderNumber) {
    throw new Error('Phone OTP is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.');
  }

  cachedSmsClient = {
    client: twilio(accountSid, authToken),
    senderNumber,
  };

  return cachedSmsClient;
};

const sendEmailOtp = async (email, otp) => {
  const transporter = getEmailTransport();
  const fromAddress = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  await transporter.sendMail({
    from: fromAddress,
    to: email,
    subject: 'KindKart verification code',
    text: 'Your KindKart verification code is ' + otp + '. It expires in 10 minutes.',
    html:
      '<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5">' +
      '<h2 style="margin-bottom:12px">KindKart Verification</h2>' +
      '<p>Your verification code is:</p>' +
      '<p style="font-size:28px;font-weight:700;letter-spacing:4px">' + otp + '</p>' +
      '<p>This code expires in 10 minutes.</p>' +
      '</div>',
  });
};

const sendEmailMessage = async ({ to, subject, text, html }) => {
  const transporter = getEmailTransport();
  const fromAddress = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  await transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    text,
    html,
  });
};

const sendPhoneOtp = async (phone, otp) => {
  const sms = getSmsClient();

  await sms.client.messages.create({
    body: 'Your KindKart verification code is ' + otp + '. It expires in 10 minutes.',
    from: sms.senderNumber,
    to: phone,
  });
};

const sendPhoneMessage = async (phone, message) => {
  const sms = getSmsClient();

  await sms.client.messages.create({
    body: message,
    from: sms.senderNumber,
    to: phone,
  });
};

exports.sendOtpMessage = async (channel, value, otp) => {
  if (channel === 'email') {
    await sendEmailOtp(value, otp);
    return;
  }

  if (channel === 'phone') {
    await sendPhoneOtp(value, otp);
    return;
  }

  throw new Error('Unsupported OTP channel');
};

exports.sendNotificationMessage = async ({
  email,
  phone,
  subject,
  text,
  html,
  channels = ['email'],
}) => {
  const normalizedChannels = Array.isArray(channels) ? channels : ['email'];
  const delivery = [];

  if (normalizedChannels.includes('email') && email) {
    try {
      await sendEmailMessage({
        to: email,
        subject,
        text,
        html,
      });
      delivery.push({ channel: 'email', status: 'sent' });
    } catch (error) {
      console.warn('Notification email skipped:', error.message);
      delivery.push({ channel: 'email', status: 'skipped', reason: error.message });
    }
  }

  if (normalizedChannels.includes('phone') && phone) {
    try {
      await sendPhoneMessage(phone, text);
      delivery.push({ channel: 'phone', status: 'sent' });
    } catch (error) {
      console.warn('Notification SMS skipped:', error.message);
      delivery.push({ channel: 'phone', status: 'skipped', reason: error.message });
    }
  }

  return delivery;
};
