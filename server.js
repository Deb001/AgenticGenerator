// server.js
// Express server that serves static assets and provides a POST /api/evaluate endpoint.

const express = require('express');
const helmet = require('helmet');
const path = require('path');
const dotenv = require('dotenv');
const { ExpressionEvaluator } = require('./evaluator');

/**
 * Create and configure an Express application.
 * @returns {import('express').Express} Configured Express app.
 */
function createServer() {
  // Load environment variables from .env (if present)
  dotenv.config();

  const app = express();

  // Security middleware
  app.use(helmet());

  // Body parser with size limit to mitigate payload attacks
  app.use(express.json({ limit: '1kb' }));

  // Serve static files from the public directory
  const publicPath = path.join(__dirname, 'public');
  app.use(express.static(publicPath));

  // POST /api/evaluate endpoint
  app.post('/api/evaluate', async (req, res, next) => {
    try {
      const { expression } = req.body;
      if (typeof expression !== 'string' || expression.trim() === '') {
        return res.status(400).json({ error: 'Request body must contain a non‑empty "expression" string.' });
      }
      const result = ExpressionEvaluator.evaluate(expression);
      return res.status(200).json({ result });
    } catch (err) {
      if (err instanceof SyntaxError || err.message === 'Division by zero') {
        return res.status(400).json({ error: err.message });
      }
      // Unexpected error – forward to global error handler
      return next(err);
    }
  });

  // Global error handling middleware (must be after all routes)
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, _next) => {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  return app;
}

// Start the server if this file is executed directly
if (require.main === module) {
  const app = createServer();
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

module.exports = { createServer };
