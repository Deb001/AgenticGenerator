import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import path from 'path';
import authRouter from './routes/auth';
import portfolioRouter from './routes/portfolio';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/portfolios', portfolioRouter);

// Swagger UI
const swaggerDocument = yaml.load(path.resolve(__dirname, '../swagger.yaml'));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Global error handler
app.use((err: any, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

export default app;
