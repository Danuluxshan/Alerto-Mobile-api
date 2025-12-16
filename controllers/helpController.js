// controllers/helpController.js
import nodemailer from 'nodemailer';
import Contact from '../models/Contact.js';

// Create reusable transporter (configure once, use many times)
let transporter = null;

// Initialize email transporter
const initializeTransporter = () => {
  if (transporter) {
    return transporter;
  }

  // Email configuration from environment variables
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // Your email
      pass: process.env.SMTP_PASS, // Your email password or app password
    },
  });

  return transporter;
};

// Send help/support message via email
export const sendHelpMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required fields'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    // Get recipient email from contacts table
    const contact = await Contact.findOne().sort({ createdAt: -1 });

    if (!contact || !contact.email) {
      return res.status(404).json({
        success: false,
        error: 'Contact email not found in database. Please configure contact information first.'
      });
    }

    const recipientEmail = contact.email;

    // Initialize email transporter
    const emailTransporter = initializeTransporter();

    // Verify transporter configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({
        success: false,
        error: 'Email service not configured. Please set SMTP_USER and SMTP_PASS environment variables.'
      });
    }

    // Email content
    const mailOptions = {
      from: process.env.SMTP_USER, // Sender email
      to: recipientEmail, // Recipient email from contacts table
      replyTo: email, // User's email for reply
      subject: `Help Center Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
            New Help Center Message
          </h2>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>From:</strong> ${name}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin: 10px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
            <p>This message was sent from the Alerto Help Center.</p>
            <p>You can reply directly to this email to respond to ${name}.</p>
          </div>
        </div>
      `,
      text: `
New Help Center Message

From: ${name}
Email: ${email}
Date: ${new Date().toLocaleString()}

Message:
${message}

---
This message was sent from the Alerto Help Center.
You can reply directly to this email to respond to ${name}.
      `
    };

    // Send email
    const info = await emailTransporter.sendMail(mailOptions);

    console.log('Email sent successfully:', info.messageId);

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
      data: {
        messageId: info.messageId,
        recipient: recipientEmail
      }
    });
  } catch (error) {
    console.error('Error sending help message:', error);

    // Handle specific email errors
    if (error.code === 'EAUTH') {
      return res.status(500).json({
        success: false,
        error: 'Email authentication failed. Please check SMTP credentials.'
      });
    }

    if (error.code === 'ECONNECTION') {
      return res.status(500).json({
        success: false,
        error: 'Could not connect to email server. Please check SMTP configuration.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to send message. Please try again later.',
      message: error.message
    });
  }
};
