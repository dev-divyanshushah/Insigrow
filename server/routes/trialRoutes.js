const express = require('express');
const router = express.Router();
const { db, SUPPORTED_INDUSTRIES } = require('../db');
const { requireAuth } = require('../auth');

/**
 * GET /api/trials
 * Returns current user's trials for all 4 industries with live status & remaining time
 */
router.get('/', requireAuth, (req, res) => {
  try {
    const trials = db.getUserTrials(req.user.id);
    return res.json({
      success: true,
      trials
    });
  } catch (err) {
    console.error('Error fetching trials:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve trial statuses.' });
  }
});

/**
 * POST /api/trials/activate
 * Activates an independent 15-day free trial for a specific industry
 */
router.post('/activate', requireAuth, (req, res) => {
  try {
    const { industry } = req.body;

    if (!industry) {
      return res.status(400).json({
        success: false,
        message: 'Industry key is required (fmcg, ca, manufacturing, or b2b).'
      });
    }

    const indKey = industry.toLowerCase().trim();
    if (!SUPPORTED_INDUSTRIES.includes(indKey)) {
      return res.status(400).json({
        success: false,
        message: `Invalid industry: "${industry}". Valid options are: ${SUPPORTED_INDUSTRIES.join(', ')}`
      });
    }

    // Activate the trial persistently in backend
    const updatedTrial = db.activateTrial(req.user.id, indKey);
    const allTrials = db.getUserTrials(req.user.id);

    return res.json({
      success: true,
      message: `Your 15-day free trial for ${industry.toUpperCase()} has been activated successfully!`,
      trial: updatedTrial,
      trials: allTrials
    });
  } catch (err) {
    console.error('Error activating trial:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to activate trial.'
    });
  }
});

/**
 * GET /api/trials/check/:industry
 * Checks if a specific industry trial is currently active for the user
 */
router.get('/check/:industry', requireAuth, (req, res) => {
  const { industry } = req.params;
  const indKey = industry.toLowerCase().trim();

  if (!SUPPORTED_INDUSTRIES.includes(indKey)) {
    return res.status(400).json({ success: false, message: 'Invalid industry key.' });
  }

  const trials = db.getUserTrials(req.user.id);
  const trial = trials[indKey];

  return res.json({
    success: true,
    industry: indKey,
    isTrialActive: trial ? trial.isTrialActive : false,
    trial
  });
});

module.exports = router;

