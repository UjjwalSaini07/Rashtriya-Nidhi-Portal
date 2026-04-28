const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join('logs', 'error.log'), level: 'error', maxsize: 10485760, maxFiles: 10 }),
    new winston.transports.File({ filename: path.join('logs', 'combined.log'), maxsize: 10485760, maxFiles: 10 }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({ format: winston.format.combine(winston.format.colorize(), winston.format.simple()) }));
}

module.exports = logger;
