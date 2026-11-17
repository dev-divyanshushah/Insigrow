const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { requireAuth, generateToken } = require('../auth');
const { sendEmployeeInvitationEmail } = require('../services/emailService');

const SHIFTS_SSO_SECRET = process.env.SHIFTS_SSO_SECRET || 'shiftflow-wfm-jwt-development-secret-key-32-chars-2026';
const SHIFTPLANNER_CLIENT_URL = process.env.SHIFTPLANNER_CLIENT_URL || 'http://localhost:3000';
const SHIFTPLANNER_API_URL = process.env.SHIFTPLANNER_API_URL || 'http://localhost:5001/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/shifts/invitations
 * Protected: Manager invites one or multiple employees
 */
router.post('/invitations', requireAuth, async (req, res) => {
  try {
    const rawList = Array.isArray(req.body.employees)
      ? req.body.employees
      : [req.body];

    if (!rawList.length || !rawList[0].email) {
      return res.status(400).json({
        success: false,
        message: 'At least one valid employee email is required.'
      });
    }

    const orgName = req.user.companyName || 'Apex Contact Solutions';
    const inviterName = req.user.fullName || 'Operations Manager';
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;

    const createdInvites = [];
    const errors = [];

    for (const emp of rawList) {
      const email = (emp.email || '').trim().toLowerCase();
      const fullName = (emp.fullName || emp.name || '').trim();
      const role = (emp.role || 'Frontline Specialist').trim();
      const department = (emp.department || 'Operations').trim();

      if (!email || !EMAIL_REGEX.test(email)) {
        errors.push({ email, error: 'Invalid email address format.' });
        continue;
      }

      // Check if user already exists as an employee
      const existingUser = db.findUserByEmail(email);
      if (existingUser && existingUser.role === 'EMPLOYEE') {
        // Still allow re-sending invite or link
      }

      // Create persistent invitation record
      const invite = db.createInvitation({
        organizationName: orgName,
        invitedBy: inviterName,
        email,
        fullName: fullName || email.split('@')[0],
        role,
        department
      });

      const inviteUrl = `${appUrl}/#/shifts/invite?token=${invite.token}`;

      // Dispatch real invitation email
      let emailResult = { success: false };
      try {
        emailResult = await sendEmployeeInvitationEmail({
          to: email,
          employeeName: invite.fullName,
          inviterName,
          organizationName: orgName,
          role,
          department,
          inviteUrl,
          expiresAt: invite.expiresAt
        });
      } catch (emErr) {
        console.error(`Failed to send invite email to ${email}:`, emErr);
      }

      createdInvites.push({
        ...invite,
        inviteUrl,
        emailSent: emailResult.success,
        previewUrl: emailResult.previewUrl || null,
        messageId: emailResult.messageId || null
      });
    }

    return res.status(201).json({
      success: true,
      message: `Successfully generated ${createdInvites.length} employee invitation(s).`,
      invitations: createdInvites,
      errors: errors.length ? errors : undefined
    });
  } catch (err) {
    console.error('Error creating invitations:', err);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating employee invitations.'
    });
  }
});

/**
 * GET /api/shifts/invitations
 * Protected: Retrieves sent invitations for the current organization
 */
router.get('/invitations', requireAuth, (req, res) => {
  try {
    const orgName = req.user.companyName;
    const invitations = db.getInvitationsByOrganization(orgName);
    return res.json({
      success: true,
      invitations
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve invitations.'
    });
  }
});

/**
 * GET /api/shifts/invitations/verify
 * Public: Verifies an employee invitation token
 */
router.get('/invitations/verify', (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Invitation token is missing.'
      });
    }

    const invite = db.findInvitationByToken(token);
    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'This invitation link is invalid or could not be found.'
      });
    }

    if (invite.status === 'accepted') {
      return res.status(410).json({
        success: false,
        message: 'This invitation has already been accepted. Please sign in directly.',
        alreadyAccepted: true,
        email: invite.email
      });
    }

    const now = new Date().getTime();
    const expiry = new Date(invite.expiresAt).getTime();
    if (now > expiry) {
      return res.status(410).json({
        success: false,
        message: 'This invitation has expired. Please ask your manager to send a new invitation.',
        expired: true
      });
    }

    return res.json({
      success: true,
      invitation: {
        token: invite.token,
        email: invite.email,
        fullName: invite.fullName,
        organizationName: invite.organizationName,
        role: invite.role,
        department: invite.department,
        expiresAt: invite.expiresAt
      }
    });
  } catch (err) {
    console.error('Verify invitation error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error verifying invitation.'
    });
  }
});

/**
 * POST /api/shifts/invitations/accept
 * Public: Employee completes registration via invitation token
 */
router.post('/invitations/accept', async (req, res) => {
  try {
    const { token, password, confirmPassword, fullName, phoneNumber } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Invitation token is required.' });
    }

    const invite = db.findInvitationByToken(token);
    if (!invite) {
      return res.status(404).json({ success: false, message: 'Invalid or nonexistent invitation token.' });
    }

    if (invite.status === 'accepted') {
      return res.status(400).json({ success: false, message: 'This invitation has already been accepted.' });
    }

    if (new Date().getTime() > new Date(invite.expiresAt).getTime()) {
      return res.status(400).json({ success: false, message: 'This invitation link has expired.' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const userFullName = (fullName || invite.fullName || 'Frontline Employee').trim();
    const userPhone = (phoneNumber || '0000000000').trim();

    // Check if user already exists
    let user = db.findUserByEmail(invite.email);
    if (!user) {
      // Create user with explicit role: EMPLOYEE (prevent privilege escalation)
      user = db.createUser({
        fullName: userFullName,
        companyName: invite.organizationName,
        email: invite.email,
        phoneNumber: userPhone,
        password,
        industry: 'shifts',
        role: 'EMPLOYEE',
        onboardingCompleted: true
      });
    } else {
      // Ensure user role is EMPLOYEE for this workspace
      db.updateUser(user.id, {
        role: 'EMPLOYEE',
        companyName: invite.organizationName
      });
    }

    // Mark invitation as accepted
    db.acceptInvitation(token, user.id);

    // Activate SHIFTS trial for this user if not yet active
    try {
      db.activateTrial(user.id, 'shifts');
    } catch (_) {}

    // Bridge registration to ShiftPlanner backend if reachable
    if (typeof fetch === 'function') {
      try {
        fetch(`${SHIFTPLANNER_API_URL}/auth/register-employee`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: user.fullName,
            corporateEmail: user.email,
            password: password,
            employeeId: `EMP-${Date.now().toString().slice(-4)}`,
            inviteCode: 'SHIFTFLOW-EMP',
            department: invite.department || 'Customer Support',
            role: invite.role || 'Support Specialist'
          })
        }).catch(() => {});
      } catch (_) {}
    }

    // Log the employee in
    const safeUser = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      companyName: user.companyName,
      industry: user.industry,
      role: 'EMPLOYEE'
    };

    const authToken = generateToken(safeUser);
    res.cookie('insigrow_token', authToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    // Generate SSO launch token for EMPLOYEE role to launch into Employee Dashboard
    const nonce = crypto.randomBytes(16).toString('hex');
    const ssoPayload = {
      type: 'INSIGROW_SSO_LAUNCH',
      insigrowUserId: user.id,
      email: user.email,
      name: user.fullName,
      organizationName: user.companyName,
      role: 'EMPLOYEE',
      targetRoute: '/employee/dashboard',
      nonce
    };

    const ssoToken = jwt.sign(ssoPayload, SHIFTS_SSO_SECRET, { expiresIn: '60s' });
    const launchUrl = `${SHIFTPLANNER_CLIENT_URL}/sso-launch?token=${encodeURIComponent(ssoToken)}`;

    return res.status(200).json({
      success: true,
      message: 'Welcome to the team! Your employee account is ready.',
      user: safeUser,
      token: authToken,
      launchUrl
    });
  } catch (err) {
    console.error('Accept invitation error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error accepting invitation.'
    });
  }
});

/**
 * POST /api/shifts/onboarding/complete
 * Protected: Completes the 5-step onboarding wizard
 */
router.post('/onboarding/complete', requireAuth, (req, res) => {
  try {
    const { organizationProfile, departments, shiftTemplates } = req.body;

    const updatedUser = db.updateUser(req.user.id, {
      onboardingCompleted: true,
      onboardingConfig: {
        completedAt: new Date().toISOString(),
        organizationProfile: organizationProfile || {},
        departments: departments || [],
        shiftTemplates: shiftTemplates || []
      }
    });

    return res.json({
      success: true,
      message: 'Onboarding configuration saved successfully.',
      user: updatedUser
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to save onboarding configuration.'
    });
  }
});

/**
 * GET /api/shifts/email-queue
 * Protected: Inspects queued emails
 */
router.get('/email-queue', requireAuth, (req, res) => {
  try {
    const queue = db.getEmailQueue();
    return res.json({
      success: true,
      count: queue.length,
      queue
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve email queue.'
    });
  }
});

module.exports = router;
