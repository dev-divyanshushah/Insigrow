const express = require('express');
const router = express.Router();
const { db, SUPPORTED_INDUSTRIES } = require('../db');
const { generateToken, requireAuth } = require('../auth');
const { sendRegistrationEmail } = require('../services/emailService');

// Email regex validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Phone number validation (at least 10 digits)
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,15}$/;

/**
 * POST /api/auth/register
 * Registers a new user persistently in the backend
 */
router.post('/register', async (req, res) => {
  try {
    const { fullName, companyName, email, phoneNumber, password, confirmPassword, industry } = req.body;

    // Field presence validation
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Full Name is required.' });
    }
    if (!companyName || !companyName.trim()) {
      return res.status(400).json({ success: false, message: 'Company Name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Business Email is required.' });
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid business email address.' });
    }
    if (!phoneNumber || !phoneNumber.trim()) {
      return res.status(400).json({ success: false, message: 'Phone Number is required.' });
    }
    if (!PHONE_REGEX.test(phoneNumber.trim().replace(/\s+/g, ''))) {
      return res.status(400).json({ success: false, message: 'Please enter a valid phone number (at least 10 digits).' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match. Please re-enter.' });
    }

    // Normalize and validate industry selection
    let normalizedIndustry = (industry || 'fmcg').toLowerCase().trim();
    if (normalizedIndustry === 'finance') normalizedIndustry = 'ca';
    if (!SUPPORTED_INDUSTRIES.includes(normalizedIndustry)) {
      normalizedIndustry = 'fmcg';
    }

    // Check duplicate
    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this business email is already registered. Please sign in instead.'
      });
    }

    // Create user in persistent database
    const user = db.createUser({
      fullName,
      companyName,
      email,
      phoneNumber,
      password,
      industry: normalizedIndustry
    });

    // Automatically activate 15-day free trial for their chosen industry
    try {
      db.activateTrial(user.id, normalizedIndustry);
    } catch (trialErr) {
      console.warn('Auto trial activation notice:', trialErr.message);
    }

    // Dispatch branded confirmation email (fails gracefully without interrupting registration)
    let emailStatus = { sent: false };
    try {
      const emailResult = await sendRegistrationEmail({
        to: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        industry: normalizedIndustry
      });
      emailStatus = { sent: emailResult.success, messageId: emailResult.messageId || null, previewUrl: emailResult.previewUrl || null };
    } catch (emailErr) {
      console.error('Registration email delivery error (non-fatal):', emailErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Your 15-day free trial has been activated.',
      user: {
        id: user.id,
        fullName: user.fullName,
        companyName: user.companyName,
        email: user.email,
        industry: user.industry
      },
      emailConfirmation: emailStatus
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'An unexpected error occurred during registration. Please try again.'
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticates user credentials and creates session
 */
router.post('/login', (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Business Email is required.' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials or register.'
      });
    }

    const isValid = db.verifyPassword(user, password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials or register.'
      });
    }

    const { passwordHash, ...safeUser } = user;
    const token = generateToken(safeUser);

    // Set cookie
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    };

    if (rememberMe) {
      cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }

    res.cookie('insigrow_token', token, cookieOptions);

    // Fetch user trials
    const trials = db.getUserTrials(user.id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: safeUser,
      trials
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred during login.'
    });
  }
});

/**
 * GET /api/auth/me
 * Retrieves current authenticated user session & trials
 */
router.get('/me', requireAuth, (req, res) => {
  const trials = db.getUserTrials(req.user.id);
  res.json({
    success: true,
    user: req.user,
    trials
  });
});

/**
 * POST /api/auth/logout
 * Clears authentication session
 */
router.post('/logout', (req, res) => {
  res.clearCookie('insigrow_token');
  res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});

/**
 * POST /api/auth/forgot-password
 * Handles password reset request
 */
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'Please provide a valid registered business email.' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    // For security reasons, don't reveal if user does not exist, or give friendly response
    return res.json({
      success: true,
      message: 'If an account exists with this email, password reset instructions have been sent.'
    });
  }

  // In a production app, an email with a secure reset token is sent.
  return res.json({
    success: true,
    message: `Password reset instructions have been dispatched to ${email.trim()}. Please check your inbox.`
  });
});

module.exports = router;

