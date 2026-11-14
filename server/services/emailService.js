const nodemailer = require('nodemailer');

// Industry display name and feature highlights
const INDUSTRY_METADATA = {
  fmcg: {
    name: 'FMCG – Consumer Goods',
    highlight: 'Real-time sales velocity, secondary sales tracking, regional depot inventory, and automated replenishment.',
    accentColor: '#00A7D3'
  },
  manufacturing: {
    name: 'Manufacturing – Production & Operations',
    highlight: 'Shop-floor OEE monitoring, assembly line telemetry, raw material BOM planning, and downtime root cause analysis.',
    accentColor: '#116D7B'
  },
  b2b: {
    name: 'B2B Enterprise – Business Solutions',
    highlight: 'Multi-stage deal pipelines, key account 360, lead auto-scoring, and recurring revenue ARR forecasting.',
    accentColor: '#528F4D'
  },
  ca: {
    name: 'Finance – CA & Advisory',
    highlight: 'Statutory filing calendars (GST/ROC), client receivables aging, Schedule III reports, and financial ratio analytics.',
    accentColor: '#B251A6'
  },
  shifts: {
    name: 'SHIFTS – Workforce & Shift Management',
    highlight: 'Intelligent shift scheduling, constraint-based roster generation, staggered break management, and real-time conflict auto-resolution.',
    accentColor: '#087F8C'
  }
};

/**
 * Creates or retrieves the Nodemailer transporter based on environment configuration
 */
let cachedTransporter = null;

async function getTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
    SMTP_SERVICE
  } = process.env;

  // 1. If explicit SMTP credentials are provided, use them
  if (SMTP_HOST && SMTP_USER) {
    console.log(`[Email Service] Initializing SMTP transport for host: ${SMTP_HOST}:${SMTP_PORT || 587}`);
    cachedTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: SMTP_SECURE === 'true' || Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      }
    });
    return cachedTransporter;
  }

  if (SMTP_SERVICE && SMTP_USER) {
    console.log(`[Email Service] Initializing standard service transport: ${SMTP_SERVICE}`);
    cachedTransporter = nodemailer.createTransport({
      service: SMTP_SERVICE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
    return cachedTransporter;
  }

  // 2. Fallback: If in test / development without credentials, create real Ethereal test account
  // or fall back to local direct logger if offline
  try {
    console.log('[Email Service] No custom SMTP credentials detected. Provisioning Ethereal test account...');
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log(`[Email Service] Test SMTP ready. Account: ${testAccount.user}`);
    return cachedTransporter;
  } catch (err) {
    console.warn('[Email Service] Ethereal test account creation failed (likely offline). Using simulated transporter:', err.message);
    // Create dummy transporter that logs
    cachedTransporter = {
      sendMail: async (mailOptions) => {
        console.log('====================================================');
        console.log('[Email Service] SIMULATED DISPATCH (No SMTP Available)');
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log('--- Body Preview ---');
        console.log(mailOptions.text || mailOptions.html.substring(0, 300));
        console.log('====================================================');
        return {
          messageId: `sim_${Date.now()}@insigrow.local`,
          response: 'Simulated local dispatch',
          simulated: true
        };
      }
    };
    return cachedTransporter;
  }
}

/**
 * Generates responsive branded HTML email template
 */
function buildEmailTemplate({ fullName, companyName, industryKey, industryName, trialDays = 15 }) {
  const meta = INDUSTRY_METADATA[industryKey] || INDUSTRY_METADATA.fmcg;
  const appUrl = process.env.APP_URL || 'http://localhost:5000';
  const solutionUrl = industryKey === 'shifts' ? `${appUrl}/#/shifts/onboarding` : `${appUrl}/#/industry/${industryKey}`;
  const ctaLabel = industryKey === 'shifts' ? 'Begin Manager Onboarding →' : `Open Your ${industryName.split('–')[0].trim()} Workspace →`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Insigrow</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F5F9FA;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #173846;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #F5F9FA;
      padding: 40px 16px;
      box-sizing: border-box;
    }
    .card {
      max-width: 580px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #DDE9EB;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(23, 56, 70, 0.06);
    }
    .header-bar {
      background-color: #173846;
      padding: 24px 32px;
      border-bottom: 3px solid #00A7D3;
      text-align: left;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #FFFFFF;
      margin: 0;
      text-transform: uppercase;
    }
    .brand-subtitle {
      font-size: 11px;
      letter-spacing: 0.15em;
      color: #00A7D3;
      margin: 4px 0 0 0;
      text-transform: uppercase;
      font-weight: 700;
    }
    .content {
      padding: 36px 32px 28px;
    }
    h1 {
      font-size: 24px;
      font-weight: 750;
      color: #173846;
      margin: 0 0 12px 0;
      line-height: 1.25;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #536B75;
      margin: 0 0 20px 0;
    }
    .trial-box {
      background: #F1F7EF;
      border: 1px solid #BCE0CA;
      border-left: 4px solid #528F4D;
      border-radius: 8px;
      padding: 20px 24px;
      margin: 24px 0;
    }
    .trial-kicker {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: #3F753B;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .trial-title {
      font-size: 17px;
      font-weight: 700;
      color: #173846;
      margin: 0 0 8px 0;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0 8px 0;
      font-size: 14px;
    }
    .info-table td {
      padding: 8px 0;
      border-bottom: 1px solid #E2EEE5;
    }
    .info-table td.label {
      color: #71878F;
      width: 40%;
      font-weight: 500;
    }
    .info-table td.val {
      color: #173846;
      font-weight: 700;
      text-align: right;
    }
    .button-wrap {
      text-align: center;
      margin: 32px 0 24px 0;
    }
    .cta-btn {
      display: inline-block;
      background-color: #116D7B;
      color: #FFFFFF !important;
      font-size: 15px;
      font-weight: 700;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      letter-spacing: 0.02em;
    }
    .features-list {
      background-color: #F8FBFB;
      border: 1px solid #DDE9EB;
      border-radius: 8px;
      padding: 20px 24px;
      margin: 24px 0;
    }
    .features-list h4 {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #173846;
      margin: 0 0 12px 0;
    }
    .feature-item {
      font-size: 13px;
      color: #536B75;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
    }
    .footer {
      border-top: 1px solid #DDE9EB;
      padding: 24px 32px;
      text-align: center;
      background-color: #FAFDFE;
      font-size: 12px;
      color: #8C9FA6;
      line-height: 1.6;
    }
    .footer strong {
      color: #173846;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header-bar">
        <h2 class="brand-title">INSIGROW</h2>
        <div class="brand-subtitle">Enterprise Solutions Portal</div>
      </div>
      <div class="content">
        <h1>Welcome to Insigrow, ${fullName}!</h1>
        <p>
          Your corporate account for <strong>${companyName}</strong> has been successfully created.
          Your workspace has been tailored specifically for the <strong>${industryName}</strong> sector.
        </p>

        <div class="trial-box">
          <div class="trial-kicker">Complimentary Enterprise Access</div>
          <div class="trial-title">${trialDays}-Day Free Trial Active</div>
          <p style="font-size: 13px; margin-bottom: 12px; color: #4F6B58;">
            You have full access to all standard and premium telemetry features with zero upfront payment and no credit card required.
          </p>
          <table class="info-table">
            <tr>
              <td class="label">Organization:</td>
              <td class="val">${companyName}</td>
            </tr>
            <tr>
              <td class="label">Selected Industry:</td>
              <td class="val">${industryName}</td>
            </tr>
            <tr>
              <td class="label">Trial Duration:</td>
              <td class="val">${trialDays} Days (Full Access)</td>
            </tr>
            <tr>
              <td class="label">Payment Required:</td>
              <td class="val">None / Free Trial</td>
            </tr>
          </table>
        </div>

        <div class="features-list">
          <h4>What You Can Do Today</h4>
          <div class="feature-item">✔ Monitor real-time operational telemetry & KPIs</div>
          <div class="feature-item">✔ Explore ${meta.highlight}</div>
          <div class="feature-item">✔ Test advanced forecasting models and root cause analytics</div>
        </div>

        <div class="button-wrap">
          <a href="${solutionUrl}" class="cta-btn">${ctaLabel}</a>
        </div>

        <p style="font-size: 12px; color: #8C9FA6; text-align: center; margin-top: 16px;">
          Need assistance getting started? Reply directly to this email or reach our support team at support@insigrow.com.
        </p>
      </div>

      <div class="footer">
        <div><strong>Insigrow</strong> · Enterprise Management Platform</div>
        <div>Powered by <strong>Ei8 Technologies</strong></div>
        <div style="margin-top: 8px;">© 2026 Insigrow Technologies Inc. All rights reserved.</div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Builds plain text fallback for clients without HTML support
 */
function buildPlainText({ fullName, companyName, industryName, trialDays = 15 }) {
  return `
WELCOME TO INSIGROW
====================================================
Hello ${fullName},

Your corporate account for "${companyName}" has been successfully created on the Insigrow Enterprise Solutions Portal.

YOUR 15-DAY FREE TRIAL IS ACTIVE:
- Organization: ${companyName}
- Selected Solution: ${industryName}
- Trial Duration: ${trialDays} Days (Full Access)
- Credit Card: Not Required (100% Free Trial)

Log in to access your workspace:
http://localhost:5000/#/login

If you have any questions, contact us at support@insigrow.com.

Best regards,
The Insigrow Team
Powered by Ei8 Technologies
© 2026 Insigrow Technologies Inc.
  `.trim();
}

/**
 * Sends a registration confirmation email
 *
 * @param {Object} options
 * @param {string} options.to - Recipient business email
 * @param {string} options.fullName - User's full name
 * @param {string} options.companyName - Company name
 * @param {string} options.industry - Industry key ('fmcg', 'ca', 'manufacturing', 'b2b')
 * @returns {Promise<{ success: boolean, messageId?: string, previewUrl?: string }>}
 */
async function sendRegistrationEmail({ to, fullName, companyName, industry }) {
  try {
    const transporter = await getTransporter();
    const indKey = (industry || 'fmcg').toLowerCase().trim();
    const meta = INDUSTRY_METADATA[indKey] || INDUSTRY_METADATA.fmcg;
    const industryName = meta.name;

    const fromAddress = process.env.SMTP_FROM || '"Insigrow Enterprise" <welcome@insigrow.com>';
    const subject = indKey === 'shifts'
      ? 'Welcome to SHIFTS – Your 15-Day Free Trial Starts Now!'
      : `Welcome to Insigrow – Your ${industryName.split('–')[0].trim()} Workspace & 15-Day Free Trial`;

    const mailOptions = {
      from: fromAddress,
      to,
      subject,
      text: buildPlainText({ fullName, companyName, industryName, trialDays: 15 }),
      html: buildEmailTemplate({ fullName, companyName, industryKey: indKey, industryName, trialDays: 15 })
    };

    console.log(`[Email Service] Dispatching confirmation email to: ${to} for industry: ${indKey}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Confirmation email sent successfully. Message ID: ${info.messageId}`);

    let previewUrl = null;
    if (nodemailer.getTestMessageUrl && info) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[Email Service] Ethereal preview URL: ${previewUrl}`);
      }
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl
    };
  } catch (err) {
    console.error('[Email Service] Failed to deliver registration confirmation email:', err);
    try {
      const { db } = require('../db');
      db.enqueueEmail({
        to,
        type: 'REGISTRATION_CONFIRMATION',
        industry,
        subject: `Welcome to ${industry === 'shifts' ? 'SHIFTS' : 'Insigrow'}`,
        error: err.message
      });
    } catch (_) {}
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Builds responsive branded HTML template for Employee Invitation
 */
function buildInvitationTemplate({ employeeName, inviterName, organizationName, role, department, inviteUrl, expiresAt }) {
  const formattedExpiry = expiresAt ? new Date(expiresAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : '7 Days';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Join ${organizationName} on SHIFTS</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F5F9FA;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #173846;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #F5F9FA;
      padding: 40px 16px;
      box-sizing: border-box;
    }
    .card {
      max-width: 580px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #DDE9EB;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(23, 56, 70, 0.06);
    }
    .header-bar {
      background-color: #14243B;
      padding: 24px 32px;
      border-bottom: 3px solid #087F8C;
      text-align: left;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #FFFFFF;
      margin: 0;
      text-transform: uppercase;
    }
    .brand-subtitle {
      font-size: 11px;
      letter-spacing: 0.15em;
      color: #087F8C;
      margin: 4px 0 0 0;
      text-transform: uppercase;
      font-weight: 700;
    }
    .content {
      padding: 36px 32px 28px;
    }
    h1 {
      font-size: 22px;
      font-weight: 750;
      color: #14243B;
      margin: 0 0 12px 0;
      line-height: 1.3;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #536B75;
      margin: 0 0 20px 0;
    }
    .invite-box {
      background: #E8F5F5;
      border: 1px solid #B8E0E3;
      border-left: 4px solid #087F8C;
      border-radius: 8px;
      padding: 20px 24px;
      margin: 24px 0;
    }
    .invite-kicker {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: #087F8C;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .invite-title {
      font-size: 17px;
      font-weight: 700;
      color: #14243B;
      margin: 0 0 8px 0;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0 8px 0;
      font-size: 14px;
    }
    .info-table td {
      padding: 8px 0;
      border-bottom: 1px solid #CCE3E6;
    }
    .info-table td.label {
      color: #71878F;
      width: 40%;
      font-weight: 500;
    }
    .info-table td.val {
      color: #14243B;
      font-weight: 700;
      text-align: right;
    }
    .button-wrap {
      text-align: center;
      margin: 32px 0 24px 0;
    }
    .cta-btn {
      display: inline-block;
      background-color: #087F8C;
      color: #FFFFFF !important;
      font-size: 15px;
      font-weight: 700;
      text-decoration: none;
      padding: 14px 34px;
      border-radius: 6px;
      letter-spacing: 0.02em;
    }
    .role-guidelines {
      background-color: #F8FBFB;
      border: 1px solid #DDE9EB;
      border-radius: 8px;
      padding: 18px 22px;
      margin: 24px 0;
    }
    .role-guidelines h4 {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #14243B;
      margin: 0 0 10px 0;
    }
    .guideline-item {
      font-size: 13px;
      color: #536B75;
      margin-bottom: 6px;
    }
    .footer {
      border-top: 1px solid #DDE9EB;
      padding: 24px 32px;
      text-align: center;
      background-color: #FAFDFE;
      font-size: 12px;
      color: #8C9FA6;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header-bar">
        <h2 class="brand-title">SHIFTS · INSIGROW</h2>
        <div class="brand-subtitle">Workforce & Shift Management</div>
      </div>
      <div class="content">
        <h1>You've been invited to join ${organizationName}!</h1>
        <p>
          Hello ${employeeName || 'there'},<br>
          <strong>${inviterName}</strong> has invited you to join the workforce team for <strong>${organizationName}</strong> on the SHIFTS platform.
        </p>

        <div class="invite-box">
          <div class="invite-kicker">Frontline Employee Invitation</div>
          <div class="invite-title">${organizationName} Workspace</div>
          <table class="info-table">
            <tr>
              <td class="label">Organization:</td>
              <td class="val">${organizationName}</td>
            </tr>
            <tr>
              <td class="label">Department:</td>
              <td class="val">${department || 'Operations'}</td>
            </tr>
            <tr>
              <td class="label">Assigned Role:</td>
              <td class="val">${role || 'Frontline Specialist'}</td>
            </tr>
            <tr>
              <td class="label">Invitation Valid Until:</td>
              <td class="val">${formattedExpiry}</td>
            </tr>
          </table>
        </div>

        <div class="role-guidelines">
          <h4>With your Employee Portal access, you can:</h4>
          <div class="guideline-item">✔ View your published weekly shift schedules & break assignments</div>
          <div class="guideline-item">✔ Submit weekly availability preferences & time-off requests</div>
          <div class="guideline-item">✔ Request peer shift swaps with supervisor approval</div>
        </div>

        <div class="button-wrap">
          <a href="${inviteUrl}" class="cta-btn">Accept Invitation & Set Password →</a>
        </div>

        <p style="font-size: 12px; color: #8C9FA6; text-align: center; margin-top: 16px;">
          If the button does not work, copy and paste this link into your browser:<br>
          <a href="${inviteUrl}" style="color: #087F8C; word-break: break-all;">${inviteUrl}</a>
        </p>
      </div>

      <div class="footer">
        <div><strong>SHIFTS</strong> by Insigrow · Workforce Management Platform</div>
        <div>Powered by <strong>Ei8 Technologies</strong></div>
        <div style="margin-top: 8px;">© 2026 Insigrow Technologies Inc. All rights reserved.</div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Builds plain text fallback for employee invitation email
 */
function buildInvitationPlainText({ employeeName, inviterName, organizationName, role, department, inviteUrl, expiresAt }) {
  return `
YOU'VE BEEN INVITED TO JOIN ${organizationName.toUpperCase()} ON SHIFTS
====================================================
Hello ${employeeName || 'there'},

${inviterName} has invited you to join the team for "${organizationName}" on SHIFTS Workforce Management.

INVITATION DETAILS:
- Organization: ${organizationName}
- Department: ${department || 'Operations'}
- Role: ${role || 'Frontline Specialist'}
- Valid Until: ${expiresAt || '7 Days'}

To accept your invitation, activate your employee account, and set your password, visit:
${inviteUrl}

Once accepted, you will have instant access to your personal shift schedules, break rotations, and availability management.

Best regards,
The SHIFTS Team · Insigrow
Powered by Ei8 Technologies
© 2026 Insigrow Technologies Inc.
  `.trim();
}

/**
 * Dispatches an employee invitation email
 *
 * @param {Object} options
 * @param {string} options.to - Employee email address
 * @param {string} options.employeeName - Employee full name
 * @param {string} options.inviterName - Manager / Organization owner name
 * @param {string} options.organizationName - Company / Organization name
 * @param {string} options.role - Employee role (e.g. 'Frontline Specialist')
 * @param {string} options.department - Department name (e.g. 'Customer Support')
 * @param {string} options.inviteUrl - Acceptance link with token
 * @param {string} options.expiresAt - Expiration ISO date
 * @returns {Promise<{ success: boolean, messageId?: string, previewUrl?: string }>}
 */
async function sendEmployeeInvitationEmail({ to, employeeName, inviterName, organizationName, role, department, inviteUrl, expiresAt }) {
  try {
    const transporter = await getTransporter();
    const fromAddress = process.env.SMTP_FROM || '"SHIFTS by Insigrow" <invites@insigrow.com>';
    const subject = `You've been invited to join ${organizationName} on SHIFTS`;

    const mailOptions = {
      from: fromAddress,
      to,
      subject,
      text: buildInvitationPlainText({ employeeName, inviterName, organizationName, role, department, inviteUrl, expiresAt }),
      html: buildInvitationTemplate({ employeeName, inviterName, organizationName, role, department, inviteUrl, expiresAt })
    };

    console.log(`[Email Service] Dispatching employee invitation to: ${to} for org: ${organizationName}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Invitation email sent successfully. Message ID: ${info.messageId}`);

    let previewUrl = null;
    if (nodemailer.getTestMessageUrl && info) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[Email Service] Ethereal invitation preview URL: ${previewUrl}`);
      }
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl
    };
  } catch (err) {
    console.error('[Email Service] Failed to deliver employee invitation email:', err);
    try {
      const { db } = require('../db');
      db.enqueueEmail({
        to,
        type: 'EMPLOYEE_INVITATION',
        organizationName,
        subject: `You've been invited to join ${organizationName} on SHIFTS`,
        inviteUrl,
        error: err.message
      });
    } catch (_) {}

    return {
      success: false,
      error: err.message
    };
  }
}

module.exports = {
  sendRegistrationEmail,
  sendEmployeeInvitationEmail,
  INDUSTRY_METADATA
};

