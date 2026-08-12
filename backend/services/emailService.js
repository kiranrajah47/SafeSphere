// Mock / SMTP Email Service for SafeSphere notifications
const sendEmailNotification = async (toEmail, subject, textMessage, htmlMessage = null) => {
  try {
    // If SMTP Env credentials are provided, use nodemailer
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const mailOptions = {
        from: process.env.SMTP_FROM || '"SafeSphere Emergency System" <no-reply@safesphere.org>',
        to: toEmail,
        subject: subject,
        text: textMessage,
        html: htmlMessage || `<div style="font-family: sans-serif; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px;"><h2 style="color: #dc2626;">${subject}</h2><p>${textMessage}</p><hr/><p style="font-size: 12px; color: #64748b;">Sent automatically by SafeSphere Personal Safety Platform.</p></div>`
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[SMTP Email Sent] To: ${toEmail}, MessageID: ${info.messageId}`);
      return { success: true, mode: 'SMTP', messageId: info.messageId };
    }

    // Default Mock Fallback Mode (Console logger for demo/dev evaluation)
    console.log('\n======================================================');
    console.log(`[EMERGENCY EMAIL MOCK DISPATCH]`);
    console.log(`To: ${toEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${textMessage}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('======================================================\n');

    return { success: true, mode: 'MOCK_CONSOLE', messageId: `mock_email_${Date.now()}` };
  } catch (error) {
    console.error('[Email Service Error]', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmailNotification };
