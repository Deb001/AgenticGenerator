import express from 'express';
import cors from 'cors';
import db from './config/db.js';
import auth from './middleware/auth.js';
import ScheduleController from './controllers/ScheduleController.js';

/**
 * Creates and configures the Express application.
 * @returns {import('express').Express}
 */
export function createApp() {
  const app = express();

  // Core middlewares
  app.use(cors());
  app.use(express.json());

  // Authentication applied globally
  app.use(auth);

  // Route mounting
  app.use('/api/schedules', ScheduleController.router);

  // Global error‑handling middleware
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  });

  return app;
}

/**
 * Starts the HTTP server after DB connection and sync.
 * @param {number} port - Port number to listen on.
 */
export async function startServer(port) {
  try {
    await db.authenticate();
    await db.sync();
    const app = createApp();

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Catch unhandled promise rejections globally
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optional: graceful shutdown
});

// If executed directly, start the server
if (require.main === module) {
  const PORT = Number(process.env.PORT) || 3000;
  startServer(PORT);
}