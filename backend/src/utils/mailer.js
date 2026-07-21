import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendOTPEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"Smart Clinic System" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '🔐 Your Verification Code - Smart Clinic System',
    html: `<p>Your 6-digit OTP code is: <b>${otp}</b>. It is valid for 10 minutes.</p>`
  };

  return await transporter.sendMail(mailOptions);
};