// controllers/notificationController.js
import User from '../models/User.js';
import { sendPushNotification, sendPushNotificationToMultiple } from '../services/notificationService.js';

/**
 * Get user's FCM tokens (for debugging)
 */
export const getUserTokens = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    const user = await User.findById(userId).select('fcmTokens fullname email');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        userId: user._id,
        fullname: user.fullname,
        email: user.email,
        fcmTokens: user.fcmTokens || [],
        tokenCount: user.fcmTokens ? user.fcmTokens.length : 0,
      },
    });
  } catch (error) {
    console.error('Get user tokens error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching user tokens',
    });
  }
};

/**
 * Send test notification to a user
 */
export const sendTestNotification = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    const user = await User.findById(userId).select('fcmTokens fullname');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    if (!user.fcmTokens || user.fcmTokens.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'User has no FCM tokens registered',
        data: {
          userId: user._id,
          fullname: user.fullname,
          tokenCount: 0,
        },
      });
    }

    const title = 'Test Notification';
    const body = `Hello ${user.fullname}, this is a test notification from Alerto!`;
    const data = {
      type: 'test',
      timestamp: new Date().toISOString(),
    };

    console.log(`🧪 Sending test notification to user ${userId} with ${user.fcmTokens.length} token(s)`);
    console.log(`📱 Tokens:`, user.fcmTokens);

    const result = await sendPushNotificationToMultiple(
      user.fcmTokens,
      title,
      body,
      data
    );

    // Remove invalid tokens if any
    if (result.tokensToRemove && result.tokensToRemove.length > 0) {
      const updatedTokens = user.fcmTokens.filter(
        token => !result.tokensToRemove.includes(token)
      );
      await User.findByIdAndUpdate(userId, { fcmTokens: updatedTokens });
      console.log(`🗑️  Removed ${result.tokensToRemove.length} invalid token(s) for user ${userId}`);
    }

    res.json({
      success: result.success,
      message: result.success
        ? `Test notification sent successfully`
        : `Failed to send test notification`,
      data: {
        userId: user._id,
        fullname: user.fullname,
        tokensAttempted: user.fcmTokens.length,
        successCount: result.successCount || 0,
        failureCount: result.failureCount || 0,
        tokensRemoved: result.tokensToRemove?.length || 0,
        error: result.error,
      },
    });
  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Error sending test notification',
      details: error.message,
    });
  }
};

/**
 * Check notification system status
 */
export const getNotificationStatus = async (req, res) => {
  try {
    // Check Firebase Admin initialization by checking environment variables
    let firebaseStatus = 'unknown';
    let firebaseError = null;
    let firebaseNote = null;
    
    const hasCredentials = !!(
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    );
    
    if (hasCredentials) {
      // Try to import and check if Firebase is initialized
      try {
        const admin = (await import('firebase-admin')).default;
        if (admin.apps.length > 0) {
          firebaseStatus = 'initialized';
          firebaseNote = 'Firebase Admin SDK ready for native FCM tokens';
        } else {
          // Check if we have any users with tokens to determine if we need Firebase
          const User = (await import('../models/User.js')).default;
          const usersWithTokens = await User.countDocuments({
            fcmTokens: { $exists: true, $ne: [] },
          });
          
          if (usersWithTokens > 0) {
            // Check token type of first user with tokens
            const sampleUser = await User.findOne({
              fcmTokens: { $exists: true, $ne: [] },
            }).select('fcmTokens');
            
            if (sampleUser && sampleUser.fcmTokens.length > 0) {
              const isExpoToken = sampleUser.fcmTokens[0]?.startsWith('ExponentPushToken');
              if (isExpoToken) {
                firebaseStatus = 'not_required';
                firebaseNote = 'Using Expo Push Notification Service (Expo tokens detected). Firebase Admin SDK not needed.';
              } else {
                firebaseStatus = 'not_initialized';
                firebaseError = 'Firebase Admin SDK not initialized but native FCM tokens detected. Please restart server or check initialization.';
              }
            } else {
              firebaseStatus = 'not_initialized';
              firebaseNote = 'Firebase credentials present but SDK not initialized. Will initialize when needed.';
            }
          } else {
            firebaseStatus = 'ready';
            firebaseNote = 'Firebase credentials present. Will initialize when native FCM tokens are registered.';
          }
        }
      } catch (error) {
        firebaseStatus = 'error';
        firebaseError = error.message;
      }
    } else {
      firebaseStatus = 'not_configured';
      firebaseNote = 'Firebase credentials not configured. System will use Expo Push Notification Service for Expo tokens.';
    }

    // Count users with tokens
    const usersWithTokens = await User.countDocuments({
      fcmTokens: { $exists: true, $ne: [] },
    });

    const totalTokens = await User.aggregate([
      { $match: { fcmTokens: { $exists: true, $ne: [] } } },
      { $project: { tokenCount: { $size: '$fcmTokens' } } },
      { $group: { _id: null, total: { $sum: '$tokenCount' } } },
    ]);

    res.json({
      success: true,
      data: {
        firebaseAdmin: {
          status: firebaseStatus,
          error: firebaseError,
          note: firebaseNote,
          hasCredentials: !!(
            process.env.FIREBASE_PROJECT_ID &&
            process.env.FIREBASE_CLIENT_EMAIL &&
            process.env.FIREBASE_PRIVATE_KEY
          ),
          projectId: process.env.FIREBASE_PROJECT_ID || 'not set',
        },
        tokens: {
          usersWithTokens,
          totalTokens: totalTokens[0]?.total || 0,
        },
        environment: {
          nodeEnv: process.env.NODE_ENV || 'development',
        },
      },
    });
  } catch (error) {
    console.error('Get notification status error:', error);
    res.status(500).json({
      success: false,
      error: 'Error checking notification status',
      details: error.message,
    });
  }
};

