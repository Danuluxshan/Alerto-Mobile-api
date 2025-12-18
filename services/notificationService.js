// services/notificationService.js
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { Expo } from 'expo-server-sdk';

dotenv.config();

// Initialize Firebase Admin SDK
let firebaseAdminInitialized = false;

const initializeFirebaseAdmin = () => {
  if (firebaseAdminInitialized) {
    return;
  }

  try {
    // Check if Firebase credentials are provided
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
      console.warn('⚠️  Firebase credentials not found.');
      console.warn('   This is OK if using Expo push tokens (Expo Push Notification Service will be used).');
      console.warn('   For native FCM tokens, set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL in your .env file');
      return;
    }

    // Initialize Firebase Admin
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      console.log('✅ Firebase Admin SDK initialized successfully');
      firebaseAdminInitialized = true;
    } else {
      firebaseAdminInitialized = true;
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error);
    console.error('   Error details:', error.message);
    // Don't throw - allow system to continue with Expo tokens if available
    firebaseAdminInitialized = false;
  }
};

/**
 * Send push notification to a single FCM token
 * @param {string} token - FCM token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data payload
 * @returns {Promise<object>}
 */
export const sendPushNotification = async (token, title, body, data = {}) => {
  try {
    initializeFirebaseAdmin();

    if (!firebaseAdminInitialized) {
      console.warn('Firebase Admin not initialized. Skipping notification.');
      return { success: false, error: 'Firebase Admin not initialized' };
    }

    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: {
        ...data,
        // Convert all data values to strings (FCM requirement)
        ...Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key]);
          return acc;
        }, {}),
      },
      token: token,
      android: {
        priority: 'high',
        notification: {
          channelId: 'alerto-notifications',
          sound: 'default',
          vibrateTimingsMillis: [0, 250, 250, 250],
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Push notification sent successfully:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
    
    // Handle invalid token errors
    if (error.code === 'messaging/invalid-registration-token' || 
        error.code === 'messaging/registration-token-not-registered') {
      return { success: false, error: 'Invalid or unregistered token', shouldRemoveToken: true };
    }
    
    return { success: false, error: error.message };
  }
};

/**
 * Check if token is an Expo push token
 * @param {string} token - Token to check
 * @returns {boolean}
 */
const isExpoPushToken = (token) => {
  return token && typeof token === 'string' && token.startsWith('ExponentPushToken[');
};

/**
 * Send push notification using Expo Push Notification Service
 * @param {string[]} tokens - Array of Expo push tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data payload
 * @returns {Promise<object>}
 */
const sendExpoPushNotifications = async (tokens, title, body, data = {}) => {
  try {
    const expo = new Expo();
    
    // Filter out invalid tokens
    const validTokens = tokens.filter(token => Expo.isExpoPushToken(token));
    
    if (validTokens.length === 0) {
      return { success: false, error: 'No valid Expo push tokens' };
    }

    // Create messages
    const messages = validTokens.map(token => ({
      to: token,
      sound: 'default',
      title: title,
      body: body,
      data: data,
      priority: 'high',
    }));

    // Send in chunks (Expo allows up to 100 at a time)
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending Expo push notification chunk:', error);
      }
    }

    // Check for errors
    const tokensToRemove = [];
    tickets.forEach((ticket, idx) => {
      if (ticket.status === 'error') {
        if (ticket.message === 'InvalidCredentials' || 
            ticket.message === 'DeviceNotRegistered') {
          tokensToRemove.push(validTokens[idx]);
        }
        console.error(`Expo push error for token ${validTokens[idx]}:`, ticket.message);
      }
    });

    const successCount = tickets.filter(t => t.status === 'ok').length;
    const failureCount = tickets.filter(t => t.status === 'error').length;

    console.log(`✅ Expo push notifications sent: ${successCount} successful, ${failureCount} failed`);

    return {
      success: successCount > 0,
      successCount: successCount,
      failureCount: failureCount,
      tokensToRemove: tokensToRemove,
    };
  } catch (error) {
    console.error('❌ Error sending Expo push notifications:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send push notification to multiple FCM tokens
 * Supports both native FCM tokens and Expo push tokens
 * @param {string[]} tokens - Array of FCM tokens or Expo push tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data payload
 * @returns {Promise<object>}
 */
export const sendPushNotificationToMultiple = async (tokens, title, body, data = {}) => {
  try {
    if (!tokens || tokens.length === 0) {
      return { success: false, error: 'No tokens provided' };
    }

    // Check if tokens are Expo push tokens
    const isExpo = isExpoPushToken(tokens[0]);
    
    if (isExpo) {
      console.log('📱 Using Expo Push Notification Service');
      return await sendExpoPushNotifications(tokens, title, body, data);
    }

    // Use Firebase Admin SDK for native FCM tokens
    console.log('🔥 Using Firebase Admin SDK');
    initializeFirebaseAdmin();

    if (!firebaseAdminInitialized) {
      console.warn('Firebase Admin not initialized. Skipping notification.');
      return { success: false, error: 'Firebase Admin not initialized' };
    }

    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: {
        ...data,
        // Convert all data values to strings (FCM requirement)
        ...Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key]);
          return acc;
        }, {}),
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'alerto-notifications',
          sound: 'default',
          vibrateTimingsMillis: [0, 250, 250, 250],
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    // Use sendMulticast for multiple tokens
    const response = await admin.messaging().sendEachForMulticast({
      tokens: tokens,
      ...message,
    });

    console.log(`✅ Push notifications sent: ${response.successCount} successful, ${response.failureCount} failed`);

    // Return tokens that need to be removed (invalid tokens)
    const tokensToRemove = [];
    if (response.responses) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success && 
            (resp.error?.code === 'messaging/invalid-registration-token' || 
             resp.error?.code === 'messaging/registration-token-not-registered')) {
          tokensToRemove.push(tokens[idx]);
        }
      });
    }

    return {
      success: response.successCount > 0,
      successCount: response.successCount,
      failureCount: response.failureCount,
      tokensToRemove: tokensToRemove,
    };
  } catch (error) {
    console.error('❌ Error sending push notifications:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send task assignment notification to staff members
 * @param {string[]} userIds - Array of user IDs to notify
 * @param {string} taskId - Task ID
 * @param {string} threatType - Type of threat/alert
 * @param {string} cameraName - Name of the camera
 * @param {string} cameraLocation - Location of the camera
 * @returns {Promise<object>}
 */
export const sendTaskAssignmentNotification = async (userIds, taskId, threatType, cameraName, cameraLocation = '') => {
  try {
    // Import User model dynamically to avoid circular dependencies
    const User = (await import('../models/User.js')).default;

    console.log(`📤 Preparing to send task assignment notification`);
    console.log(`   Task ID: ${taskId}`);
    console.log(`   User IDs: ${JSON.stringify(userIds)}`);
    console.log(`   Threat Type: ${threatType}`);
    console.log(`   Camera: ${cameraName}`);
    console.log(`   Location: ${cameraLocation || 'Not specified'}`);

    // Get FCM tokens for all users
    const users = await User.find({ _id: { $in: userIds } }).select('fcmTokens fullname email');
    
    if (!users || users.length === 0) {
      console.warn('⚠️  No users found for task assignment notification');
      return { success: false, error: 'No users found' };
    }

    console.log(`👥 Found ${users.length} user(s) to notify`);

    // Collect all FCM tokens
    const allTokens = [];
    const userTokenMap = {}; // Map token to user for logging
    
    users.forEach(user => {
      console.log(`   User: ${user.fullname} (${user.email})`);
      if (user.fcmTokens && Array.isArray(user.fcmTokens) && user.fcmTokens.length > 0) {
        console.log(`   Tokens: ${user.fcmTokens.length} token(s)`);
        user.fcmTokens.forEach(token => {
          allTokens.push(token);
          if (!userTokenMap[token]) {
            userTokenMap[token] = [];
          }
          userTokenMap[token].push(user.fullname);
        });
      } else {
        console.warn(`   ⚠️  No FCM tokens found for user ${user.fullname} (${user._id})`);
      }
    });

    if (allTokens.length === 0) {
      console.error('❌ No FCM tokens found for any users');
      console.error('   This means users have not registered their device tokens.');
      console.error('   Users need to login to the app to register their tokens.');
      return { success: false, error: 'No FCM tokens found' };
    }

    console.log(`📱 Total tokens to send: ${allTokens.length}`);
    console.log(`   Token preview: ${allTokens[0]?.substring(0, 50)}...`);

    // Check if tokens are Expo push tokens (start with "ExponentPushToken")
    const isExpoToken = allTokens[0]?.startsWith('ExponentPushToken');
    if (isExpoToken) {
      console.log('📱 Detected Expo push tokens - will use Expo Push Notification Service');
    } else {
      console.log('🔥 Detected native FCM tokens - will use Firebase Admin SDK');
    }

    // Send notification
    const title = 'New Task Assigned';
    const body = `You have been assigned a new task: ${threatType} at ${cameraName}`;
    const data = {
      type: 'task_assigned',
      taskId: taskId,
      threatType: threatType,
      cameraName: cameraName,
      cameraLocation: cameraLocation || '',
    };

    console.log(`📨 Sending notification...`);
    console.log(`   Title: ${title}`);
    console.log(`   Body: ${body}`);

    const result = await sendPushNotificationToMultiple(allTokens, title, body, data);

    console.log(`📊 Notification result:`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Successful: ${result.successCount || 0}`);
    console.log(`   Failed: ${result.failureCount || 0}`);
    if (result.error) {
      console.error(`   Error: ${result.error}`);
    }

    // Remove invalid tokens from users
    if (result.tokensToRemove && result.tokensToRemove.length > 0) {
      console.log(`🗑️  Removing ${result.tokensToRemove.length} invalid token(s)`);
      for (const user of users) {
        const updatedTokens = user.fcmTokens.filter(token => !result.tokensToRemove.includes(token));
        if (updatedTokens.length !== user.fcmTokens.length) {
          await User.findByIdAndUpdate(user._id, { fcmTokens: updatedTokens });
          console.log(`   Removed ${user.fcmTokens.length - updatedTokens.length} invalid token(s) for user ${user.fullname}`);
        }
      }
    }

    return result;
  } catch (error) {
    console.error('❌ Error sending task assignment notification:', error);
    console.error('   Stack:', error.stack);
    return { success: false, error: error.message };
  }
};

/**
 * Send notification to admin users when staff responds to an alert
 * @param {string} staffName - Name of the staff member who responded
 * @param {string} cameraName - Name of the camera
 * @param {string} responseMessage - Staff's response message
 * @param {string} taskId - Task ID
 * @param {Date} responseTime - Time when response was submitted
 * @returns {Promise<object>}
 */
export const sendStaffResponseNotification = async (staffName, cameraName, responseMessage, taskId, responseTime) => {
  try {
    // Import User model dynamically to avoid circular dependencies
    const User = (await import('../models/User.js')).default;

    console.log(`📤 Preparing to send staff response notification to admins`);
    console.log(`   Staff: ${staffName}`);
    console.log(`   Camera: ${cameraName}`);
    console.log(`   Task ID: ${taskId}`);

    // Get all admin users (admin and superadmin roles)
    const adminUsers = await User.find({
      role: { $in: ['admin', 'superadmin'] }
    }).select('fcmTokens fullname email');

    if (!adminUsers || adminUsers.length === 0) {
      console.warn('⚠️  No admin users found for staff response notification');
      return { success: false, error: 'No admin users found' };
    }

    console.log(`👥 Found ${adminUsers.length} admin user(s) to notify`);

    // Collect all FCM tokens from admin users
    const allTokens = [];
    adminUsers.forEach(admin => {
      console.log(`   Admin: ${admin.fullname} (${admin.email})`);
      if (admin.fcmTokens && Array.isArray(admin.fcmTokens) && admin.fcmTokens.length > 0) {
        console.log(`   Tokens: ${admin.fcmTokens.length} token(s)`);
        allTokens.push(...admin.fcmTokens);
      } else {
        console.warn(`   ⚠️  No FCM tokens found for admin ${admin.fullname} (${admin._id})`);
      }
    });

    if (allTokens.length === 0) {
      console.error('❌ No FCM tokens found for any admin users');
      console.error('   Admins need to login to the app to register their tokens.');
      return { success: false, error: 'No FCM tokens found for admins' };
    }

    console.log(`📱 Total tokens to send: ${allTokens.length}`);

    // Format notification message
    const title = `${staffName} has responded to the alert on ${cameraName}`;
    const body = `"${responseMessage}"`;
    
    // Calculate time ago
    const now = new Date();
    const diffInMs = now.getTime() - responseTime.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    let timeAgo = 'Just now';
    if (diffInHours > 0) {
      timeAgo = `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes > 0) {
      timeAgo = `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }

    const data = {
      type: 'staff_response',
      taskId: taskId,
      staffName: staffName,
      cameraName: cameraName,
      responseMessage: responseMessage,
      timeAgo: timeAgo,
      timestamp: responseTime.toISOString(),
    };

    console.log(`📨 Sending notification...`);
    console.log(`   Title: ${title}`);
    console.log(`   Body: ${body}`);

    const result = await sendPushNotificationToMultiple(allTokens, title, body, data);

    console.log(`📊 Notification result:`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Successful: ${result.successCount || 0}`);
    console.log(`   Failed: ${result.failureCount || 0}`);

    // Remove invalid tokens from admin users
    if (result.tokensToRemove && result.tokensToRemove.length > 0) {
      console.log(`🗑️  Removing ${result.tokensToRemove.length} invalid token(s)`);
      for (const admin of adminUsers) {
        const updatedTokens = admin.fcmTokens.filter(token => !result.tokensToRemove.includes(token));
        if (updatedTokens.length !== admin.fcmTokens.length) {
          await User.findByIdAndUpdate(admin._id, { fcmTokens: updatedTokens });
          console.log(`   Removed ${admin.fcmTokens.length - updatedTokens.length} invalid token(s) for admin ${admin.fullname}`);
        }
      }
    }

    return result;
  } catch (error) {
    console.error('Error sending staff response notification:', error);
    console.error('   Stack:', error.stack);
    return { success: false, error: error.message };
  }
};
