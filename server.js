import express from 'express';
import helmet from 'helmet';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables from .env file if present
dotenv.config();

// Resolve __dirname in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Basic security headers – disable CSP for simplicity in this example
app.use(helmet({ contentSecurityPolicy: false }));

// Serve static assets from the Vite production build directory
const staticPath = path.resolve(__dirname, 'dist');
app.use(express.static(staticPath));

// Fallback to index.html for SPA routing (any unknown route)
app.get('*', (req, res) => {
  res.sendFile(path.resolve(staticPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
