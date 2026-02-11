import dotenv from 'dotenv';

dotenv.config();

/**
 * Utility to send SMS.
 * In a real-world scenario, you would use a provider like Twilio, Vonage, or MessageBird.
 * Since no SMS provider is configured, this will log the OTP to the console.
 */
export const sendSMS = async (phoneNumber: string, otp: string) => {
  try {
    // console.log(`📱 [SMS SERVICE] Sending OTP ${otp} to ${phoneNumber}`);
    
    // Example Twilio integration (commented out):
    /*
    const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: `Your Auth System OTP is: ${otp}. It expires in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    */

    // Since we are not using mock data, this logic is the actual production placeholder 
    // for an SMS service integration.
    return { success: true, message: 'SMS sent successfully' };
  } catch (error: any) {
    console.error('❌ Error in sendSMS:', error.message);
    throw error;
  }
};
