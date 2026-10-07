require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();
connectDB();
app.use(helmet({ contentSecurityPolicy: false }));
//app.use(helmet());
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean);

app.use(cors({ origin: allowedOrigins }));

// Webhook must be before express.json()
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), require('./controllers/paymentController').webhook);

app.use(express.json());
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/family', require('./routes/familyRoutes'));
app.use('/api/readings', require('./routes/readingRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Unknown /api routes return JSON, not the website
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));

// Serve frontend static files
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));