const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');
const nodemailer = require('nodemailer');

// Email configuration (using Gmail SMTP - FREE)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Store verification codes temporarily (in production, use Redis)
const verificationCodes = new Map();

// Register route with email verification
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store verification code temporarily
    verificationCodes.set(email, {
      code: verificationCode,
      userData: { name, email, password },
      timestamp: Date.now()
    });

    // Send verification email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'SavakV2 - Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Welcome to SavakV2!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for signing up! Please use the verification code below to complete your registration:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #3b82f6; font-size: 32px; margin: 0;">${verificationCode}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't create this account, please ignore this email.</p>
          <p>Best regards,<br>The SavakV2 Team</p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ 
        message: 'Verification code sent to your email. Please check your inbox and enter the code to complete registration.',
        requiresVerification: true
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
    }
  } catch (err) {
    next(err);
  }
});

// Verify email code
router.post('/verify-email', async (req, res, next) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required.' });
    }

    const verificationData = verificationCodes.get(email);
    
    if (!verificationData) {
      return res.status(400).json({ message: 'No verification code found for this email. Please sign up again.' });
    }

    // Check if code is expired (10 minutes)
    if (Date.now() - verificationData.timestamp > 10 * 60 * 1000) {
      verificationCodes.delete(email);
      return res.status(400).json({ message: 'Verification code has expired. Please sign up again.' });
    }

    // Check if code matches
    if (verificationData.code !== code) {
      return res.status(400).json({ message: 'Invalid verification code. Please try again.' });
    }

    // Create user with username
    const userData = { ...verificationData.userData };
    
    // Generate username from email
    let username = userData.email.split('@')[0];
    if (userData.name) {
      username = userData.name.replace(/\s+/g, '').toLowerCase();
    }
    
    // Ensure username is unique
    let counter = 1;
    let originalUsername = username;
    while (await User.findOne({ username })) {
      username = `${originalUsername}${counter}`;
      counter++;
    }
    
    userData.username = username;
    const user = new User(userData);
    await user.save();
    
    // Clear verification data
    verificationCodes.delete(email);

    // Return user without password
    const userObj = user.getPublicProfile();
    res.status(201).json({ 
      message: 'Email verified successfully! Welcome to SavakV2.',
      user: userObj,
      requiresVerification: false
    });
  } catch (err) {
    next(err);
  }
});

// Resend verification code
router.post('/resend-verification', async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const verificationData = verificationCodes.get(email);
    
    if (!verificationData) {
      return res.status(400).json({ message: 'No pending verification found for this email. Please sign up again.' });
    }

    // Generate new verification code
    const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Update verification data
    verificationData.code = newVerificationCode;
    verificationData.timestamp = Date.now();
    verificationCodes.set(email, verificationData);

    // Send new verification email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'SavakV2 - New Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">New Verification Code</h2>
          <p>Hi ${verificationData.userData.name},</p>
          <p>Here's your new verification code:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #3b82f6; font-size: 32px; margin: 0;">${newVerificationCode}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>Best regards,<br>The SavakV2 Team</p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'New verification code sent to your email.' });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
    }
  } catch (err) {
    next(err);
  }
});

// Login route
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message || 'Invalid credentials' });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json({ 
        message: 'Login successful',
        user: user.getPublicProfile()
      });
    });
  })(req, res, next);
});

// Logout route
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.json({ message: 'Logout successful' });
  });
});

// Placeholder route
router.get('/', (req, res) => {
  res.json({ message: 'Auth route placeholder' });
});

// Google OAuth: Start
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth: Callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: true }),
  (req, res) => {
    // Redirect to frontend after successful login
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }
);

// Microsoft OAuth: Start
router.get('/microsoft', passport.authenticate('microsoft', { scope: ['user.read'] }));

// Microsoft OAuth: Callback
router.get('/microsoft/callback',
  passport.authenticate('microsoft', { failureRedirect: '/login', session: true }),
  (req, res) => {
    // Redirect to frontend after successful login
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }
);

// Get current authenticated user
router.get('/me', async (req, res) => {
  console.log('[Auth] /me endpoint called');
  console.log('[Auth] req.isAuthenticated:', req.isAuthenticated);
  console.log('[Auth] req.user:', req.user);
  console.log('[Auth] req.session:', req.session);
  
  if (req.isAuthenticated && req.user) {
    // Always fetch the latest user info from the database
    try {
      const user = await User.findById(req.user._id || req.user.id)
        .select('+role +userType');
      if (!user) {
        console.log('[Auth] User not found in database');
        return res.status(401).json({ message: 'Not authenticated' });
      }
      console.log('[Auth] Returning user:', user.getPublicProfile ? user.getPublicProfile() : user);
      return res.json({ user: user.getPublicProfile ? user.getPublicProfile() : user });
    } catch (err) {
      console.error('[Auth] Error fetching user:', err);
      return res.status(500).json({ message: 'Error fetching user info' });
    }
  }
  console.log('[Auth] Not authenticated, returning 401');
  res.status(401).json({ message: 'Not authenticated' });
});

module.exports = router; 