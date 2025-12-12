// scripts/seedSupportLegal.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import SupportLegal from '../models/SupportLegal.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Alerto';

async function seedSupportLegal() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for seeding');

    // About content
    await SupportLegal.findOneAndUpdate(
      { type: 'about' },
      {
        type: 'about',
        paragraphs: [
          "Our company is dedicated to creating smart security solutions for modern businesses. We developed this mobile app as part of our advanced Theft Detection System, designed to keep our clients' environments safer and more efficient.",
          "Using real-time camera alerts, our system instantly notifies the admin when suspicious activity or potential theft is detected. The admin can then quickly assign a task or send an alert directly to the staff through the app, ensuring fast action and smooth communication.",
          "Our goal is simple: enhance security, reduce losses, and empower staff with the right tools at the right time.",
          "We focus on reliability, speed, and ease of use—making sure every alert reaches the right person, exactly when it matters."
        ]
      },
      { upsert: true, new: true }
    );

    // Privacy Policy content
    await SupportLegal.findOneAndUpdate(
      { type: 'privacy_policy' },
      {
        type: 'privacy_policy',
        introduction: "We value your privacy and are committed to protecting your personal information while using our app. This policy explains how we collect, use, and safeguard your data.",
        sections: [
          {
            title: "Information We Collect",
            bullets: [
              "Personal information (name, email, phone number, position).",
              "Activity data (alerts received, tasks completed).",
              "Device and usage information."
            ]
          },
          {
            title: "How We Use Your Information",
            bullets: [
              "To deliver alerts and notifications.",
              "To manage staff tasks and communication.",
              "To improve system performance, security, and functionality."
            ]
          },
          {
            title: "Data Sharing",
            bullets: [
              "No selling or sharing with third parties.",
              "Information shared only with authorized personnel for app functions.",
              "Disclosure if required by law or for security."
            ]
          },
          {
            title: "Data Security",
            bullets: [
              "Technical and administrative measures to protect data."
            ]
          },
          {
            title: "Your Rights",
            bullets: [
              "Access, update, or request deletion of personal information.",
              "Contact support for data/privacy questions."
            ]
          },
          {
            title: "Policy Updates",
            bullets: [
              "Policy may be updated to improve security or comply with regulations. Continued use implies acceptance."
            ]
          }
        ]
      },
      { upsert: true, new: true }
    );

    // Terms of Service content
    await SupportLegal.findOneAndUpdate(
      { type: 'terms_of_service' },
      {
        type: 'terms_of_service',
        introduction: "By using our app, you agree to the following terms and conditions. Our system is designed to support our clients by providing real-time alerts, staff notifications, and improved security workflows. To ensure a safe and reliable experience, all users must follow these guidelines:",
        terms: [
          {
            title: "Authorized Use Only",
            description: "The app is for authorized staff and login details should not be shared."
          },
          {
            title: "Accurate Information",
            description: "Users are responsible for keeping their profile information up to date."
          },
          {
            title: "Alert Handling",
            description: "Users must respond responsibly to tasks/alerts from the admin."
          },
          {
            title: "Data Privacy",
            description: "Information is collected for system improvement and will not be shared with outside parties unless legally required."
          },
          {
            title: "System Integrity",
            description: "Users must not tamper with or misuse the app or security systems."
          },
          {
            title: "Updates & Changes",
            description: "The app and terms may be updated, and continued use implies acceptance."
          },
          {
            title: "Limitation of Liability",
            description: "The company is not responsible for technical issues, downtime, or delays due to external factors."
          }
        ]
      },
      { upsert: true, new: true }
    );

    console.log('Support & Legal content seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding support legal content:', error);
    process.exit(1);
  }
}

seedSupportLegal();