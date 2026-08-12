const SafeJourney = require('../models/SafeJourney');
const SOSAlert = require('../models/SOSAlert');
const User = require('../models/User');
const { sendSMSAlert } = require('./smsService');
const { getIO } = require('../config/socket');

let intervalId = null;

const startWatchdog = () => {
  if (intervalId) return;

  console.log('[Safe Journey Watchdog] Initialized timer service (30s interval check)');

  intervalId = setInterval(async () => {
    try {
      const now = new Date();
      // Find journeys in progress where expected arrival time has passed by more than 2 minutes
      const expiredJourneys = await SafeJourney.find({
        status: 'IN_PROGRESS',
        expectedArrivalTime: { $lt: new Date(now.getTime() - 2 * 60 * 1000) }
      }).populate('userId');

      for (const journey of expiredJourneys) {
        console.warn(`[Safe Journey Watchdog] Escalating expired journey for user ${journey.userId?.name || journey.userId}`);
        
        journey.status = 'ALERT_TRIGGERED';
        await journey.save();

        // Update user state
        if (journey.userId) {
          await User.findByIdAndUpdate(journey.userId._id, { isSOSActive: true });
        }

        // Create automated SOS Alert
        const userLoc = journey.userId?.currentLocation?.coordinates || [77.2090, 28.6139];
        const sos = await SOSAlert.create({
          userId: journey.userId._id,
          emergencyType: 'PANIC',
          status: 'ACTIVE',
          location: {
            type: 'Point',
            coordinates: userLoc,
            address: `Automated Safe Journey Watchdog Escalation (Destination: ${journey.destinationName})`
          },
          notes: `User missed expected arrival time (${journey.expectedArrivalTime.toLocaleTimeString()}) for destination "${journey.destinationName}".`
        });

        // Broadcast Socket event
        try {
          const io = getIO();
          io.to('admin_room').emit('sos_alert_broadcast', {
            sos,
            user: {
              _id: journey.userId._id,
              name: journey.userId.name,
              phone: journey.userId.phone
            }
          });
          io.to(`user_${journey.userId._id}`).emit('safe_journey_expired', {
            journeyId: journey._id,
            sosId: sos._id
          });
        } catch (e) {
          // Socket might not be ready in unit tests
        }

        // Dispatch SMS
        if (journey.userId?.phone) {
          await sendSMSAlert(
            journey.userId.phone,
            `[SafeSphere ALERT] Safe Journey Watchdog: ${journey.userId.name} did not check in for journey to "${journey.destinationName}". Emergency SOS activated!`
          );
        }
      }
    } catch (err) {
      console.error('[Watchdog Error]', err.message);
    }
  }, 30000); // Check every 30 seconds
};

const stopWatchdog = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

module.exports = { startWatchdog, stopWatchdog };
