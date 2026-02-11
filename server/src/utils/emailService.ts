import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const getResend = () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error('RESEND_API_KEY is not configured. Please set a valid key in .env');
    }
    return new Resend(apiKey);
};

const otpTemplate = (otp: string) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; padding: 60px 20px; color: #ffffff; text-align: center;">
    <div style="max-width: 480px; margin: 0 auto; background: #1e293b; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 48px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
      <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 24px; background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: inline-block;">Auth System</h1>
      <p style="font-size: 16px; color: #94a3b8; margin-bottom: 32px; line-height: 1.6;">Use the following security code to verify your identity. This code will expire in <span style="color: #38bdf8; font-weight: 600;">10 minutes</span>.</p>
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 700; letter-spacing: 8px; color: #ffffff; padding: 24px; background: rgba(15, 23, 42, 0.5); border-radius: 16px; margin: 32px 0; border: 1px solid rgba(56, 189, 248, 0.2);">
        ${otp}
      </div>
      <p style="font-size: 14px; color: #64748b; margin-top: 32px;">If you didn't request this code, you can safely ignore this email.</p>
      <div style="margin-top: 40px; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 24px;">
        <p style="font-size: 12px; color: #475569;">&copy; ${new Date().getFullYear()} Auth System. All rights reserved.</p>
      </div>
    </div>
  </div>
`;

const resetLinkTemplate = (link: string) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; padding: 60px 20px; color: #ffffff; text-align: center;">
    <div style="max-width: 480px; margin: 0 auto; background: #1e293b; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 48px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
      <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 24px; background: linear-gradient(135deg, #f472b6 0%, #fb7185 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: inline-block;">Reset Password</h1>
      <p style="font-size: 16px; color: #94a3b8; margin-bottom: 32px; line-height: 1.6;">You've requested to reset your password. Click the button below to proceed. This link will expire shortly.</p>
      <a href="${link}" style="display: inline-block; padding: 16px 36px; background: linear-gradient(135deg, #f472b6 0%, #fb7185 100%); color: #ffffff; text-decoration: none; font-weight: 600; border-radius: 12px; transition: transform 0.2s ease; box-shadow: 0 10px 15px -3px rgba(244, 114, 182, 0.3);">Reset Password</a>
      <p style="font-size: 14px; color: #64748b; margin-top: 32px;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="font-size: 12px; color: #38bdf8; word-break: break-all; margin-top: 12px; background: rgba(15, 23, 42, 0.5); padding: 12px; border-radius: 8px;">${link}</p>
      <div style="margin-top: 40px; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 24px;">
        <p style="font-size: 12px; color: #475569;">&copy; ${new Date().getFullYear()} Auth System. All rights reserved.</p>
      </div>
    </div>
  </div>
`;

export const sendOTP = async (email: string, otp: string) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not defined in .env');
  }

  try {
    // console.log(`📧 Attempting to send OTP to: ${email}...`);
    const { data, error } = await getResend().emails.send({
      from: 'Auth System <onboarding@resend.dev>',
      to: email,
      subject: 'Your OTP for Auth System',
      text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
      html: otpTemplate(otp),
    });

    if (error) {
      console.error('❌ Resend API Error Details:', JSON.stringify(error, null, 2));
      
      if ((error as any).statusCode === 403 || (error as any).name === 'validation_error') {
        // console.warn('⚠️ RESEND SANDBOX RESTRICTION: Email not sent to recipient.');
        // console.warn(`👉 [DEV ONLY] YOUR OTP IS: ${otp}`);
        console.warn('To fix this, verify your domain at resend.com or use the verified email: raam.phogat@gmail.com');
        return { id: 'sandbox-fallback', otp }; // Return a mock success so flow continues in dev
      }
      
      throw new Error(error.message);
    }

    // console.log(`✅ OTP successfully sent to ${email} via Resend. ID: ${data?.id}`);
    return data;
  } catch (error: any) {
    if (error.id === 'sandbox-fallback') return error;
    console.error('❌ Error in sendOTP:', error.message);
    throw error;
  }
};

export const sendResetLink = async (email: string, link: string) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not defined in .env');
  }

  try {
    // console.log(`📧 Attempting to send Reset Link to: ${email}...`);
    const { data, error } = await getResend().emails.send({
      from: 'Auth System <onboarding@resend.dev>',
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Please click the link to reset your password: ${link}`,
      html: resetLinkTemplate(link),
    });

    if (error) {
      console.error('❌ Resend API Error (Reset Link):', JSON.stringify(error, null, 2));

      // Fallback for development/sandbox mode
      if ((error as any).statusCode === 403 || (error as any).name === 'validation_error') {
        // console.warn('⚠️ RESEND SANDBOX RESTRICTION: Email not sent to recipient.');
        // console.warn(`👉 [DEV ONLY] YOUR RESET LINK IS: ${link}`);
        console.warn('To fix this, verify your domain at resend.com or use the verified email: raam.phogat@gmail.com');
        return { id: 'sandbox-fallback', link }; // Return a mock success so flow continues in dev
      }

      throw new Error(error.message);
    }

    // console.log(`✅ Reset link successfully sent to ${email} via Resend. ID: ${data?.id}`);
    return data;
  } catch (error: any) {
    if (error.id === 'sandbox-fallback') return error;
    console.error('❌ Error in sendResetLink:', error.message);
    throw error;
  }
};
