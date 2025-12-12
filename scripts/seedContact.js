// scripts/seedContact.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Contact from '../models/Contact.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Alerto';

async function seedContact() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for seeding');

    // Contact information
    await Contact.findOneAndUpdate(
      {},
      {
        phone: '947755112445',
        email: 'jyothisictzone@gmail.com',
        website: 'https://jyothisictzone.com/'
      },
      { upsert: true, new: true }
    );

    console.log('Contact information seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding contact information:', error);
    process.exit(1);
  }
}

seedContact();

