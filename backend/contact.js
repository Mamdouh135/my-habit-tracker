import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Configure your Gmail credentials here
const GMAIL_USER = 'mamdouhaiesh76@gmail.com';
const GMAIL_PASS = 'YOUR_APP_PASSWORD'; // Use an App Password, not your real password

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
});

router.post('/contact', async (req, res) => {
  const { email, message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const mailOptions = {
    from: email || GMAIL_USER,
    to: GMAIL_USER,
    subject: 'New Contact Message from Habit Tracker',
    text: `From: ${email || 'Anonymous'}\n\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send email' });
  }
});

export default router;
