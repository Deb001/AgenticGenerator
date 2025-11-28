import { Router } from 'express';
import { getAllPortfolios, getPortfolioById } from '../controllers/portfolioController';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.use(verifyToken);
router.get('/', getAllPortfolios);
router.get('/:id', getPortfolioById);

export default router;
