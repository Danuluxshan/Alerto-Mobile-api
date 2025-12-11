// scripts/seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Camera from '../models/Camera.js';
import Threat from '../models/Threat.js';
import Task from '../models/Task.js';
import EmployeeActive from '../models/EmployeeActive.js';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed data matching frontend dummy data
const seedData = async () => {
  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Camera.deleteMany({});
    await Threat.deleteMany({});
    await Task.deleteMany({});
    await EmployeeActive.deleteMany({});

    // Seed Users (with passwords from auth.ts)
    console.log('👥 Seeding users...');
    const userData = [
      {
        fullname: 'Kish Danu',
        username: 'Danu',
        email: 'danu@gmail.com',
        phonenumber: 9876543210,
        password: 'Pass@123',
        role: 'admin',
        activeStatus: true,
      },
      {
        fullname: 'Suthakaran Pavitra',
        username: 'Pavi',
        email: 'pavi@gmail.com',
        phonenumber: 9876543211,
        password: 'Pass@123',
        role: 'employee',
        activeStatus: true,
      },
      {
        fullname: 'Michael Johnson',
        username: 'michael_johnson',
        email: 'michael.johnson@example.com',
        phonenumber: 9876543212,
        password: 'password789',
        role: 'employee',
        activeStatus: true,
      },
      {
        fullname: 'Emily Williams',
        username: 'emily_williams',
        email: 'emily.williams@example.com',
        phonenumber: 9876543213,
        password: 'password012',
        role: 'admin',
        activeStatus: true,
      },
      {
        fullname: 'Danu Krish',
        username: 'david_brown',
        email: 'david.brown@example.com',
        phonenumber: 9876543214,
        password: 'password345',
        role: 'employee',
        activeStatus: true,
      },
      {
        fullname: 'Sarah Davis',
        username: 'sarah_davis',
        email: 'sarah.davis@example.com',
        phonenumber: 9876543215,
        password: 'password678',
        role: 'superadmin',
        activeStatus: true,
      },
      {
        fullname: 'Robert Miller',
        username: 'robert_miller',
        email: 'robert.miller@example.com',
        phonenumber: 9876543216,
        password: 'password901',
        role: 'employee',
        activeStatus: true,
      },
      {
        fullname: 'Jennifer Wilson',
        username: 'jennifer_wilson',
        email: 'jennifer.wilson@example.com',
        phonenumber: 9876543217,
        password: 'password234',
        role: 'admin',
        activeStatus: true,
      },
      {
        fullname: 'William Moore',
        username: 'william_moore',
        email: 'william.moore@example.com',
        phonenumber: 9876543218,
        password: 'password567',
        role: 'employee',
        activeStatus: true,
      },
      {
        fullname: 'Lisa Taylor',
        username: 'lisa_taylor',
        email: 'lisa.taylor@example.com',
        phonenumber: 9876543219,
        password: 'password890',
        role: 'admin',
        activeStatus: true,
      },
    ];

    // Hash passwords and create users
    const users = [];
    for (const user of userData) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const newUser = new User({
        ...user,
        password: hashedPassword,
      });
      await newUser.save();
      users.push(newUser);
    }
    console.log(`✅ Created ${users.length} users`);

    // Create a map of old IDs to new MongoDB IDs
    const userIdMap = {};
    userData.forEach((user, index) => {
      const oldId = (index + 1).toString();
      userIdMap[oldId] = users[index]._id.toString();
    });

    // Seed Cameras
    console.log('📹 Seeding cameras...');
    const cameraData = [
      {
        name: 'Main Entrance Camera',
        location: 'Building A',
        camera_status: true,
        camera_view: 'https://youtu.be/aKOd6fwNRqQ',
        createdAt: new Date('2024-01-15T08:30:00.000Z'),
        updatedAt: new Date('2024-12-20T14:45:00.000Z'),
      },
      {
        name: 'Parking Lot Camera',
        location: 'Building B - Parking Lot North',
        camera_status: true,
        camera_view: 'https://youtu.be/aKOd6fwNRqQ',
        createdAt: new Date('2024-02-10T10:15:00.000Z'),
        updatedAt: new Date('2024-12-19T09:20:00.000Z'),
      },
      {
        name: 'Warehouse Security Camera',
        location: 'Building C - Warehouse Section 3',
        camera_status: false,
        camera_view: 'https://youtu.be/aKOd6fwNRqQ',
        createdAt: new Date('2024-03-05T12:00:00.000Z'),
        updatedAt: new Date('2024-12-18T16:30:00.000Z'),
      },
    ];

    const cameras = [];
    for (const camera of cameraData) {
      const newCamera = new Camera(camera);
      await newCamera.save();
      cameras.push(newCamera);
    }
    console.log(`✅ Created ${cameras.length} cameras`);

    // Create a map of old camera IDs to new MongoDB IDs
    const cameraIdMap = {
      cam001: cameras[0]._id.toString(),
      cam002: cameras[1]._id.toString(),
      cam003: cameras[2]._id.toString(),
    };

    // Seed Threats
    console.log('⚠️  Seeding threats...');
    const threatData = [
      {
        camera_id: cameras[0]._id, // cam001 -> Main Entrance Camera
        threat_type: 'Intruder',
        threat_level: 'High',
        threat_status: true,
        createdAt: new Date('2024-12-20T10:30:00.000Z'),
        updatedAt: new Date('2024-12-20T10:35:00.000Z'),
      },
      {
        camera_id: cameras[1]._id, // cam002 -> Parking Lot Camera
        threat_type: 'motion',
        threat_level: 'High',
        threat_status: false,
        createdAt: new Date('2024-12-20T11:15:00.000Z'),
        updatedAt: new Date('2024-12-20T11:20:00.000Z'),
      },
      {
        camera_id: cameras[2]._id, // cam003 -> Warehouse Security Camera
        threat_type: 'Fire',
        threat_level: 'High',
        threat_status: true,
        createdAt: new Date('2024-12-20T13:45:00.000Z'),
        updatedAt: new Date('2024-12-20T13:50:00.000Z'),
      },
      {
        camera_id: cameras[0]._id, // cam001 -> Main Entrance Camera
        threat_type: 'Motion',
        threat_level: 'Low',
        threat_status: false,
        createdAt: new Date('2024-12-20T14:20:00.000Z'),
        updatedAt: new Date('2024-12-20T14:25:00.000Z'),
      },
      {
        camera_id: cameras[1]._id, // cam002 -> Parking Lot Camera
        threat_type: 'Intruder',
        threat_level: 'Medium',
        threat_status: true,
        createdAt: new Date('2024-12-20T15:10:00.000Z'),
        updatedAt: new Date('2024-12-20T15:15:00.000Z'),
      },
    ];

    const threats = [];
    for (const threat of threatData) {
      const newThreat = new Threat(threat);
      await newThreat.save();
      threats.push(newThreat);
    }
    console.log(`✅ Created ${threats.length} threats`);

    // Create a map of old threat IDs to new MongoDB IDs
    const threatIdMap = {
      threat001: threats[0]._id.toString(),
      threat002: threats[1]._id.toString(),
      threat003: threats[2]._id.toString(),
      threat004: threats[3]._id.toString(),
      threat005: threats[4]._id.toString(),
    };

    // Seed EmployeeActive
    console.log('👔 Seeding employee active status...');
    const employeeActiveData = [
      {
        user_id: users[2]._id, // user_id "3" -> Michael Johnson
        active_status: false,
        createdAt: new Date('2024-12-20T08:00:00.000Z'),
        updatedAt: new Date('2024-12-20T14:30:00.000Z'),
      },
      {
        // Note: users[1] appears twice in original data, keeping the latest (updated) version
        user_id: users[1]._id, // user_id "2" -> Suthakaran Pavitra (updated)
        active_status: true,
        createdAt: new Date('2025-12-09T09:15:00.000Z'),
        updatedAt: new Date('2025-12-10T09:15:00.000Z'),
      },
      {
        user_id: users[4]._id, // user_id "5" -> Danu Krish
        active_status: true,
        createdAt: new Date('2024-12-20T07:30:00.000Z'),
        updatedAt: new Date('2024-12-20T12:00:00.000Z'),
      },
      {
        user_id: users[6]._id, // user_id "7" -> Robert Miller
        active_status: true,
        createdAt: new Date('2024-12-20T07:30:00.000Z'),
        updatedAt: new Date('2024-12-20T12:00:00.000Z'),
      },
      {
        user_id: users[8]._id, // user_id "9" -> William Moore
        active_status: false,
        createdAt: new Date('2024-12-20T07:30:00.000Z'),
        updatedAt: new Date('2024-12-20T12:00:00.000Z'),
      },
    ];

    // Use upsert to handle unique constraint on user_id
    let createdCount = 0;
    for (const empActive of employeeActiveData) {
      const result = await EmployeeActive.findOneAndUpdate(
        { user_id: empActive.user_id },
        {
          $set: {
            active_status: empActive.active_status,
            updatedAt: empActive.updatedAt,
          },
          $setOnInsert: {
            createdAt: empActive.createdAt,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );
      if (result) createdCount++;
    }
    console.log(`✅ Created/Updated ${createdCount} employee active records`);

    // Seed Tasks
    console.log('📋 Seeding tasks...');
    const taskData = [
      {
        threat_id: threats[0]._id, // threat001
        user_ids: [users[1]._id], // user_id "2"
        review_status: true,
        report_message: [
          {
            user_id: users[1]._id, // user_id "2"
            message: 'Threat resolved. No further action needed.',
            reviewed_time: new Date('2024-12-20T12:00:00.000Z'),
          },
        ],
        createdAt: new Date('2024-12-20T11:20:00.000Z'),
        updatedAt: new Date('2024-12-20T12:00:00.000Z'),
      },
      {
        threat_id: threats[2]._id, // threat003
        user_ids: [users[4]._id], // user_id "5"
        review_status: false,
        report_message: null,
        createdAt: new Date('2024-12-20T13:50:00.000Z'),
        updatedAt: new Date('2024-12-20T13:50:00.000Z'),
      },
      {
        threat_id: threats[4]._id, // threat005
        user_ids: [users[4]._id, users[1]._id], // user_ids ["5", "2"]
        review_status: true,
        report_message: [
          {
            user_id: users[1]._id, // user_id "2"
            message: 'Threat resolved. No further action needed.',
            reviewed_time: new Date('2024-12-20T14:00:00.000Z'),
          },
          {
            user_id: users[4]._id, // user_id "5"
            message: 'No further action needed.',
            reviewed_time: new Date('2024-12-20T14:15:00.000Z'),
          },
        ],
        createdAt: new Date('2024-12-20T13:50:00.000Z'),
        updatedAt: new Date('2024-12-20T13:50:00.000Z'),
      },
    ];

    for (const task of taskData) {
      const newTask = new Task(task);
      await newTask.save();
    }
    console.log(`✅ Created ${taskData.length} tasks`);

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Cameras: ${cameras.length}`);
    console.log(`   - Threats: ${threats.length}`);
    console.log(`   - Tasks: ${taskData.length}`);
    console.log(`   - Employee Active Records: ${employeeActiveData.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run seed
const runSeed = async () => {
  await connectDB();
  await seedData();
  await mongoose.connection.close();
};

runSeed();

