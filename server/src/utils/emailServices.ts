/*
// This file is for development purposes only. 
// It mocks the email service and conceptually "sends the OTP data to the database only" 
// (though the database saving is primary handled in the controllers).

export const sendOTP = async (email: string, otp: string) => {
  console.log(`📧 [DATABASE ONLY MODE] OTP for ${email}: ${otp}`);
  // No emails will be sent. The OTP is already stored in the User record in the database.
  return { id: 'dev-mode-otp' };
};

export const sendResetLink = async (email: string, link: string) => {
  console.log(`📧 [DATABASE ONLY MODE] Reset Link for ${email}: ${link}`);
  // No emails will be sent.
  return { id: 'dev-mode-reset' };
};
*/
