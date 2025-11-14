// server/server.js

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { evaluateExpression, EvaluationError } = require('../src/evaluator');

// Load environment variables from .env file
dotenv.config();

const REQUIRED_ENV = ['PORT'];
for (const varName of REQUIRED_ENV) {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
}

const PORT = parseInt(process.env.PORT, 10) || 3000;

/**
 * Creates a rate limiter that allows a maximum of 100 requests per minute per IP.
 * @returns {import('express-rate-limit').RateLimit}
 */
function createRateLimiter() {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
  });
}

/**
 * Global error handling middleware.
 * Logs minimal error information and returns a safe JSON response.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error('Error:', err.message);
  if (res.headersSent) {
    return next(err);
  }
  // Default to 500 if status not already set
  const status = err.status || 500;
  const response = {
    error: status === 500 ? 'Internal server error' : err.message
  };
  res.status(status).json(response);
}

const app = express();

// Apply security middlewares
app.use(helmet());
app.use(cors({ origin: true })); // Allow same‑origin requests; can be tightened later.
app.use(createRateLimiter());
app.use(express.json());

// Serve static assets from the public directory (../public)
app.use(express.static(path.join(__dirname, '../../public')));

/**
 * POST /api/evaluate
 * Expects JSON body: { "expression": "2 + 3 * (4 - 1)" }
 */
app.post('/api/evaluate', (req, res, next) => {
  try {
    const { expression } = req.body;
    if (typeof expression !== 'string' || expression.trim() === '') {
      const err = new Error('Expression must be a non‑empty string');
      err.status = 400;
      throw err;
    }
    const result = evaluateExpression(expression);
    res.json({ result });
  } catch (err) {
    if (err instanceof SyntaxError || err instanceof EvaluationError) {
      err.status = 422; // Unprocessable Entity
    } else if (!err.status) {
      err.status = 500;
    }
    next(err);
  }
});

// Attach the global error handler after all routes
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});