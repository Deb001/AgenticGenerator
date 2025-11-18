import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import portfolioRouter from './routes/portfolio';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/portfolios', portfolioRouter);

// Global error handler
app.use((err: any, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

export default app;