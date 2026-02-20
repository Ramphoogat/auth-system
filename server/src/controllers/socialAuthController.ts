import { Request, Response } from "express";
import { google } from "googleapis";
import User from "../models/Users.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Helper to show loader during redirect
const sendLoaderPage = (res: Response, redirectUrl: string, message: string = "Authenticating...") => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${message}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: #f9fafb; /* Gray-50 */
          color: #374151; /* Gray-700 */
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        @media (prefers-color-scheme: dark) {
          body {
            background-color: #111827; /* Gray-900 */
            color: #d1d5db; /* Gray-300 */
          }
        }
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }
        /* Loader styles matching client/src/components/Loader.tsx */
        .loader {
          width: 48px;
          height: 48px;
          border-width: 4px;
          border-style: solid;
          border-color: #10b981; /* Emerald-500 */
          border-top-color: transparent;
          border-radius: 9999px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .text {
          font-size: 0.875rem;
          font-weight: 600;
          opacity: 0.8;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="loader"></div>
        <div class="text">${message}</div>
      </div>
      <script>
        // Redirect immediately once loaded
        window.location.href = "${redirectUrl}";
      </script>
    </body>
    </html>
  `;
  res.send(html);
};

// Google OAuth Strategy
const googleClient = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.SERVER_URL || "http://localhost:5000"}/api/auth/google/callback`
);

export const googleAuth = (req: Request, res: Response) => {
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
  ];

  const url = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });

  res.redirect(url);
};

export const googleCallback = async (req: Request, res: Response) => {
  const { code } = req.query;

  try {
    const { tokens } = await googleClient.getToken(code as string);
    googleClient.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: googleClient,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();
    
    if (!data.email) {
       sendLoaderPage(res, `${CLIENT_URL}/login?error=Google login failed: No email provided`, "Redirecting...");
       return;
    }

    let user = await User.findOne({ email: data.email });

    if (!user) {
      // Create new user
      user = new User({
        name: data.name,
        email: data.email,
        username: data.email.split("@")[0] + Math.random().toString(36).substring(7), // Generate generic username
        googleId: data.id,
        isVerified: true,
        role: "user", // Default role
        password: "social-login-" + Math.random().toString(36), // Dummy password
      });
      await user.save();
    } else {
      // Update existing user with googleId if not present
      if (!user.googleId) {
        user.googleId = data.id as string;
        await user.save();
      }
    }

    // Generate JWT
    const token = jwt.sign(
      { email: user.email, id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    // Redirect to frontend with token
    sendLoaderPage(res, `${CLIENT_URL}/login?token=${token}&role=${user.role}`, "Login Successful! Redirecting...");

  } catch (error) {
    console.error("Google Auth Error:", error);
    sendLoaderPage(res, `${CLIENT_URL}/login?error=Google login failed`, "Redirecting...");
  }
};

// Facebook OAuth Strategy (Manual Implementation)
export const facebookAuth = (req: Request, res: Response) => {
  const client_id = process.env.FACEBOOK_CLIENT_ID;
  const redirect_uri = `${process.env.SERVER_URL || "http://localhost:5000"}/api/auth/facebook/callback`;
  const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=email,public_profile`;
  res.redirect(url);
};

export const facebookCallback = async (req: Request, res: Response) => {
  const { code } = req.query;
  const client_id = process.env.FACEBOOK_CLIENT_ID;
  const client_secret = process.env.FACEBOOK_CLIENT_SECRET;
  const redirect_uri = `${process.env.SERVER_URL || "http://localhost:5000"}/api/auth/facebook/callback`;

  try {
    // Exchange code for token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${client_id}&redirect_uri=${redirect_uri}&client_secret=${client_secret}&code=${code}`
    );
    const tokenData = await tokenResponse.json();

    if (tokenData.error) throw new Error(tokenData.error.message);

    // Get User Info
    const userResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${tokenData.access_token}`
    );
    const userData = await userResponse.json();

    if (!userData.email) {
        // Facebook might not return email if user didn't grant permission or signed up with phone
        sendLoaderPage(res, `${CLIENT_URL}/login?error=Facebook login failed: No email provided`, "Redirecting...");
        return;
    }

    let user = await User.findOne({ email: userData.email });

    if (!user) {
        user = new User({
            name: userData.name,
            email: userData.email,
            username: userData.email.split("@")[0] + Math.random().toString(36).substring(7),
            facebookId: userData.id,
            isVerified: true,
            role: "user",
            password: "social-login-" + Math.random().toString(36),
        });
        await user.save();
    } else {
        if (!user.facebookId) {
            user.facebookId = userData.id;
            await user.save();
        }
    }

    const token = jwt.sign(
        { email: user.email, id: user._id.toString(), role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
    );

    sendLoaderPage(res, `${CLIENT_URL}/login?token=${token}&role=${user.role}`, "Login Successful! Redirecting...");

  } catch (error) {
    console.error("Facebook Auth Error:", error);
     sendLoaderPage(res, `${CLIENT_URL}/login?error=Facebook login failed`, "Redirecting...");
  }
};


export const twitterAuth = (req: Request, res: Response) => {
     
     res.redirect(`${CLIENT_URL}/login?error=Twitter login not fully configured on server`);
};

export const twitterCallback = async (req: Request, res: Response) => {
    res.redirect(`${CLIENT_URL}/login?error=Twitter login not implemented`);
};
