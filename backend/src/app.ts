import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import portfolioRoutes from './routes/portfolio';
import { authenticateToken } from './middleware/authMiddleware';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/portfolios', authenticateToken, portfolioRoutes);

export default app;