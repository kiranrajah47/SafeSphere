const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendSMSAlert } = require('./smsService');
const { sendEmailNotification } = require('./emailService');
const { getIO } = require('../config/socket');

/**
 * Core Notification Abstraction Service
 * Dispatches In-App, SMS, and Email notifications safely based on user preferences and API key availability.
 */

const typePreferenceMap = {
  sos_created: 'sosAlerts',
  sos_resolved: 'sosAlerts',
  nearby_alert: 'communityAlerts',
  incident_verified: 'incidentUpdates',
  journey_warning: 'journeyWarnings',
  resource_update: 'resourceUpdates'
};

const dispatchNotification = async ({ recipientUserId, type, title, message, data = {} }) => {
  const deliveredChannels = [];

  try {
    const user = await User.findById(recipientUserId);
    if (!user) return { success: false, reason: 'User not found' };

    const prefs = user.notificationPreferences || {
      inApp: true,
      sms: true,
      email: true,
      sosAlerts: true,
      communityAlerts: true,
      journeyWarnings: true,
      incidentUpdates: true,
      resourceUpdates: true
    };

    // Check specific type preference
    const prefKey = typePreferenceMap[type];
    if (prefKey && prefs[prefKey] === false) {
      console.log(`[Notification Service] User ${user.email} disabled notifications for category ${prefKey}`);
      return { success: true, deliveredChannels: [], skipped: true };
    }

    // 1. In-App Notification Dispatch
    if (prefs.inApp !== false) {
      try {
        const notif = await Notification.create({
          user: user._id,
          type,
          title,
          message,
          data
        });

        // Broadcast via Socket.IO if client connected
        try {
          const io = getIO();
          if (io) {
            io.to(`user_${user._id}`).emit('new_in_app_notification', notif);
          }
        } catch (_) {}

        deliveredChannels.push('IN_APP');
      } catch (err) {
        console.error('[Notification Service] In-App Save Error:', err.message);
      }
    }

    // 2. SMS Notification Dispatch (Twilio or Console Mock)
    if (prefs.sms !== false && user.phone) {
      try {
        await sendSMSAlert(user.phone, `${title}: ${message}`);
        deliveredChannels.push('SMS');
      } catch (err) {
        console.error('[Notification Service] SMS Dispatch Error:', err.message);
      }
    }

    // 3. Email Notification Dispatch (Nodemailer SMTP or Console Mock)
    if (prefs.email !== false && user.email) {
      try {
        await sendEmailNotification(user.email, title, message);
        deliveredChannels.push('EMAIL');
      } catch (err) {
        console.error('[Notification Service] Email Dispatch Error:', err.message);
      }
    }

    return { success: true, deliveredChannels };
  } catch (error) {
    console.error('[Notification Service Exception]', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Dispatch SOS Created Notifications to Guardians & User
 */
const notifySOSCreated = async (sos, user, contacts = []) => {
  const title = `🚨 EMERGENCY SOS ACTIVATED: ${user.name}`;
  const message = `Distress signal triggered for ${sos.emergencyType} near ${sos.location?.address || 'location'}. Live location link sent.`;

  // 1. Notify emergency contacts via SMS directly
  for (const contact of contacts) {
    if (contact.phone) {
      await sendSMSAlert(
        contact.phone,
        `🚨 EMERGENCY SOS from ${user.name}! Type: ${sos.emergencyType}. Location: ${sos.location?.address || 'Live Location'}. Contact immediately!`
      );
    }
  }

  // 2. Dispatch user in-app notification
  await dispatchNotification({
    recipientUserId: user._id,
    type: 'sos_created',
    title: '🚨 Emergency SOS Dispatched',
    message: `Your SOS alert is active. Location broadcasted to ${contacts.length} trusted contacts.`,
    data: { sosId: sos._id }
  });
};

/**
 * Dispatch SOS Resolved Notifications
 */
const notifySOSResolved = async (sos, user) => {
  await dispatchNotification({
    recipientUserId: user._id,
    type: 'sos_resolved',
    title: '✅ SOS Alert Resolved',
    message: 'Your Emergency SOS distress signal has been safely resolved.',
    data: { sosId: sos._id }
  });
};

/**
 * Dispatch Nearby Safety Alert Notifications
 */
const notifyNearbyAlert = async (alert, userIds = []) => {
  for (const userId of userIds) {
    await dispatchNotification({
      recipientUserId: userId,
      type: 'nearby_alert',
      title: `⚠️ Safety Alert: ${alert.title}`,
      message: `New ${alert.severity?.toUpperCase()} severity hazard (${alert.category}) posted near your area.`,
      data: { alertId: alert._id }
    });
  }
};

/**
 * Dispatch Incident Verified Notification
 */
const notifyIncidentVerified = async (incident, user) => {
  await dispatchNotification({
    recipientUserId: user._id,
    type: 'incident_verified',
    title: '🛡️ Incident Report Verified',
    message: `Your report "${incident.title}" has been verified by safety moderators and published as a Community Alert.`,
    data: { incidentId: incident._id }
  });
};

/**
 * Dispatch Safe Journey Warning Notification
 */
const notifyJourneyWarning = async (journey, user, guardianContact = null) => {
  // Notify user
  await dispatchNotification({
    recipientUserId: user._id,
    type: 'journey_warning',
    title: '🚨 Safe Journey Check-in Exceeded',
    message: `Your trip to "${journey.destinationName}" has passed expected arrival time. Safety escalation active.`,
    data: { journeyId: journey._id }
  });

  // Notify guardian contact via SMS if available
  if (guardianContact && guardianContact.phone) {
    await sendSMSAlert(
      guardianContact.phone,
      `🚨 SAFESPHERE JOURNEY ESCALATION: ${user.name}'s trip to "${journey.destinationName}" exceeded expected check-in time. Please reach out to verify their safety.`
    );
  }
};

/**
 * Dispatch Resource Update Notification
 */
const notifyResourceUpdate = async (resourceTitle, userIds = []) => {
  for (const userId of userIds) {
    await dispatchNotification({
      recipientUserId: userId,
      type: 'resource_update',
      title: '📚 Safety Resource Center Updated',
      message: `New safety guide or resource "${resourceTitle}" is now available.`,
      data: {}
    });
  }
};

module.exports = {
  dispatchNotification,
  notifySOSCreated,
  notifySOSResolved,
  notifyNearbyAlert,
  notifyIncidentVerified,
  notifyJourneyWarning,
  notifyResourceUpdate
};
