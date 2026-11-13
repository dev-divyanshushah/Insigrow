const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const trialRoutes = require('./routes/trialRoutes');
const industryRoutes = require('./routes/industryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/trials', trialRoutes);
app.use('/api/industry', industryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Insigrow Industry Solutions Portal',
    timestamp: new Date().toISOString()
  });
});

// SPA fallback: any other GET route serves index.html
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(publicDir, 'index.html'));
  }
  next();
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected internal server error occurred.'
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Insigrow - Industry Solutions Portal Server running`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`💼 API Base: http://localhost:${PORT}/api`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
