// Mock / Twilio SMS Service for emergency alerts
const sendSMSAlert = async (toPhone, message) => {
  try {
    // If Twilio env credentials are provided, use real Twilio client
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      const res = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: toPhone
      });
      console.log(`[Twilio SMS Sent] To: ${toPhone}, SID: ${res.sid}`);
      return { success: true, mode: 'TWILIO', messageId: res.sid };
    }

    // Default Mock Fallback Mode (Console logging for testing/college evaluation)
    console.log('\n======================================================');
    console.log(`[EMERGENCY SMS MOCK DISPATCH]`);
    console.log(`To: ${toPhone}`);
    console.log(`Body: ${message}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('======================================================\n');

    return { success: true, mode: 'MOCK_CONSOLE', messageId: `mock_${Date.now()}` };
  } catch (error) {
    console.error('[SMS Service Error]', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendSMSAlert };
