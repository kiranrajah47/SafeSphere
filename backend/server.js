const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');
const { startWatchdog } = require('./services/watchdogService');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const contactRoutes = require('./routes/contactRoutes');
const locationRoutes = require('./routes/locationRoutes');
const sosRoutes = require('./routes/sosRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const alertRoutes = require('./routes/alertRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const journeyRoutes = require('./routes/journeyRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Initialize Socket.IO
initSocket(server);

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health Check API
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'SafeSphere Backend API',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes (Mounted under /api/v1 and /api for full compatibility)
app.use('/api/v1/auth', authRoutes);
app.use('/api/auth', authRoutes);

app.use('/api/v1/users', userRoutes);

app.use('/api/v1/contacts', contactRoutes);
app.use('/api/contacts', contactRoutes);

app.use('/api/v1/location', locationRoutes);
app.use('/api/location', locationRoutes);

app.use('/api/v1/sos', sosRoutes);
app.use('/api/sos', sosRoutes);

app.use('/api/v1/resources', resourceRoutes);
app.use('/api/resources', resourceRoutes);

app.use('/api/v1/alerts', alertRoutes);
app.use('/api/alerts', alertRoutes);

app.use('/api/v1/incidents', incidentRoutes);
app.use('/api/v1/journey', journeyRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/admin', adminRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Start Watchdog Scheduler
startWatchdog();

const PORT = process.env.PORT || 5000;

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ [Port Error] Port ${PORT} is already in use by another process.`);
    console.error(`💡 Solution: Close any running node instances or change PORT in backend/.env file.\n`);
    process.exit(1);
  } else {
    console.error('[Server Error]', error.message);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 SafeSphere Backend API Server running on port ${PORT}`);
  console.log(`📡 Socket.IO Real-time Engine initialized`);
  console.log(`🛡️  Safe Journey Watchdog active`);
  console.log(`=======================================================`);
});
