require('express-async-errors');
require('dotenv').config();
const chalk = require('chalk');

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const logger = require('./config/logger');
const { globalErrorHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

const authRoutes      = require('./routes/auth.routes');
const billRoutes      = require('./routes/bill.routes');
const entityRoutes    = require('./routes/entity.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const auditRoutes     = require('./routes/audit.routes');
const publicRoutes    = require('./routes/public.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'","'unsafe-inline'"] }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://rnp.gov.in']
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));
app.use(generalLimiter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// Routes
app.use('/api/auth',       authRoutes);
app.use('/api/bills',      billRoutes);
app.use('/api/entities',   entityRoutes);
app.use('/api/dashboard',  dashboardRoutes);
app.use('/api/audit',      auditRoutes);
app.use('/api/public',     publicRoutes);

// 404
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler (must be last)
app.use(globalErrorHandler);

async function bootstrap() {
  try {
    await connectDB();
    console.log(chalk.green('✓ MongoDB connected'));

    await connectRedis();
    console.log(chalk.green('✓ Redis connected'));

    app.listen(PORT, () => {
      console.log(chalk.cyan.bold('\n  Rashtriya Nidhi Portal - Backend'));
      console.log(chalk.cyan('  ──────────────────────────────────'));
      console.log(chalk.white(`  Server : ${chalk.bold.cyan(`http://localhost:${PORT}`)}`));
      console.log(chalk.white(`  Env    : ${chalk.bold.yellow(process.env.NODE_ENV)}`));
      console.log(chalk.white(`  API    : ${chalk.bold.cyan(`http://localhost:${PORT}/api`)}`));
      console.log(chalk.white(`  Health : ${chalk.bold.cyan(`http://localhost:${PORT}/health`)}`));
      console.log(chalk.cyan('  ──────────────────────────────────\n'));
      logger.info(`RNP Backend running on port ${PORT} [${process.env.NODE_ENV}]`);
    });
  } catch (err) {
    console.log(chalk.red.bold('\n✗ Server startup failed'));
    console.log(chalk.red(`  ${err.message}\n`));
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();
module.exports = app;
