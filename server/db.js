const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TRIALS_FILE = path.join(DATA_DIR, 'trials.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to safely read JSON
function readJSON(filePath, defaultData = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf8');
      return defaultData;
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultData;
  }
}

// Helper to safely and atomically write JSON
function writeJSON(filePath, data) {
  const tempPath = `${filePath}.tmp.${Date.now()}`;
  try {
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error(`Error writing to ${filePath}:`, err);
    try {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    } catch (_) {}
    throw err;
  }
}

const SUPPORTED_INDUSTRIES = ['fmcg', 'ca', 'manufacturing', 'b2b'];
const TRIAL_DURATION_DAYS = 15;
const TRIAL_DURATION_MS = TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;

class Database {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(USERS_FILE)) writeJSON(USERS_FILE, []);
    if (!fs.existsSync(TRIALS_FILE)) writeJSON(TRIALS_FILE, []);
  }

  // User Management
  getUsers() {
    return readJSON(USERS_FILE, []);
  }

  findUserByEmail(email) {
    if (!email) return null;
    const normalized = email.trim().toLowerCase();
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === normalized) || null;
  }

  findUserById(id) {
    if (!id) return null;
    const users = this.getUsers();
    return users.find(u => u.id === id) || null;
  }

  createUser({ fullName, companyName, email, phoneNumber, password }) {
    const users = this.getUsers();
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
      throw new Error('A user with this business email is already registered.');
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      fullName: fullName.trim(),
      companyName: companyName.trim(),
      email: normalizedEmail,
      phoneNumber: phoneNumber.trim(),
      passwordHash,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeJSON(USERS_FILE, users);

    // Return safe user object (without password hash)
    const { passwordHash: _, ...safeUser } = newUser;
    return safeUser;
  }

  verifyPassword(user, password) {
    if (!user || !user.passwordHash) return false;
    return bcrypt.compareSync(password, user.passwordHash);
  }

  // Trial Management
  getTrials() {
    return readJSON(TRIALS_FILE, []);
  }

  /**
   * Returns trial state for all 4 industries for a specific user,
   * with server-calculated remaining time and status.
   */
  getUserTrials(userId) {
    const allTrials = this.getTrials();
    const userTrials = allTrials.filter(t => t.userId === userId);
    const now = Date.now();

    const result = {};

    SUPPORTED_INDUSTRIES.forEach(ind => {
      const record = userTrials.find(t => t.industry === ind);

      if (!record) {
        result[ind] = {
          industry: ind,
          status: 'not_started',
          isTrialActive: false,
          activatedAt: null,
          expiresAt: null,
          daysRemaining: 0,
          hoursRemaining: 0,
          totalDurationDays: TRIAL_DURATION_DAYS
        };
      } else {
        const expiresTime = new Date(record.expiresAt).getTime();
        const activatedTime = new Date(record.activatedAt).getTime();
        const remainingMs = expiresTime - now;

        if (remainingMs > 0) {
          const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
          const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

          result[ind] = {
            id: record.id,
            industry: ind,
            status: 'active',
            isTrialActive: true,
            activatedAt: record.activatedAt,
            expiresAt: record.expiresAt,
            daysRemaining: days,
            hoursRemaining: hours,
            minutesRemaining: minutes,
            totalDurationDays: TRIAL_DURATION_DAYS,
            progressPercent: Math.min(100, Math.max(0, Math.round(((now - activatedTime) / TRIAL_DURATION_MS) * 100)))
          };
        } else {
          result[ind] = {
            id: record.id,
            industry: ind,
            status: 'expired',
            isTrialActive: false,
            activatedAt: record.activatedAt,
            expiresAt: record.expiresAt,
            daysRemaining: 0,
            hoursRemaining: 0,
            minutesRemaining: 0,
            totalDurationDays: TRIAL_DURATION_DAYS,
            progressPercent: 100
          };
        }
      }
    });

    return result;
  }

  /**
   * Activates a 15-day free trial for a user on a specific industry.
   */
  activateTrial(userId, industry) {
    const indKey = industry.toLowerCase().trim();
    if (!SUPPORTED_INDUSTRIES.includes(indKey)) {
      throw new Error(`Unsupported industry: ${industry}. Must be one of: ${SUPPORTED_INDUSTRIES.join(', ')}`);
    }

    const trials = this.getTrials();
    const existingIndex = trials.findIndex(t => t.userId === userId && t.industry === indKey);

    const now = new Date();
    const activatedAt = now.toISOString();
    const expiresAt = new Date(now.getTime() + TRIAL_DURATION_MS).toISOString();

    let trialRecord;

    if (existingIndex >= 0) {
      const existing = trials[existingIndex];
      const remainingMs = new Date(existing.expiresAt).getTime() - Date.now();
      
      // If trial is already active, don't overwrite unless expired or forced
      if (remainingMs > 0) {
        return this.getUserTrials(userId)[indKey];
      }

      // If expired and re-activating or resetting
      trialRecord = {
        ...existing,
        status: 'active',
        activatedAt,
        expiresAt,
        updatedAt: activatedAt
      };
      trials[existingIndex] = trialRecord;
    } else {
      trialRecord = {
        id: `trl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId,
        industry: indKey,
        status: 'active',
        activatedAt,
        expiresAt,
        createdAt: activatedAt
      };
      trials.push(trialRecord);
    }

    writeJSON(TRIALS_FILE, trials);
    return this.getUserTrials(userId)[indKey];
  }

  /**
   * Checks if a user has an active trial for a given industry
   */
  isTrialActive(userId, industry) {
    const userTrials = this.getUserTrials(userId);
    const indKey = industry.toLowerCase().trim();
    return !!(userTrials[indKey] && userTrials[indKey].isTrialActive);
  }
}

const db = new Database();
module.exports = { db, SUPPORTED_INDUSTRIES, TRIAL_DURATION_DAYS };

