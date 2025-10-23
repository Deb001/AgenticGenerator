// src/server.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db.js');
const itemsRouter = require('./routes/items.js');

/**
 * Initializes the Express application.
 * - Ensures the database is ready.
 * - Applies JSON body parsing and CORS middleware.
 * - Serves static assets from the root /public directory.
 * - Mounts the items router at /api/items.
 * - Adds a generic error‑handling middleware that returns JSON.
 *
 * @returns {import('express').Express} Configured Express app instance.
 */
function createServer() {
  // Initialise the database if the module provides an explicit method.
  if (typeof db.initialize === 'function') {
    db.initialize();
  } else if (typeof db.connect === 'function') {
    db.connect();
  }

  const app = express();

  // Core middleware
  app.use(cors());
  app.use(express.json());

  // Static files
  const publicDir = path.resolve(__dirname, '..', 'public');
  app.use(express.static(publicDir));

  // API routes
  app.use('/api/items', itemsRouter);

  // Generic error handler – returns JSON { error: message }
  // This will catch errors passed via next(err) from any route.
  app.use((err, _req, res, _next) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Internal Server Error' });
  });

  return app;
}

/**
 * Starts the HTTP server on the given port.
 *
 * @param {number|string} port - Port number on which the server should listen.
 */
function startServer(port) {
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

// ---------------------------------------------------------------------------
// Application bootstrap
// ---------------------------------------------------------------------------
const app = createServer();
const PORT = process.env.PORT || 3000;
startServer(PORT);

// Export for external usage / testing
module.exports = { createServer, startServer, app };