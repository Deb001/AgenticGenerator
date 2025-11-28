import { Router } from 'express';
import { getPortfolios, getPortfolioById } from '../controllers/portfolioController';

const router = Router();

router.get('/', getPortfolios);
router.get('/:id', getPortfolioById);

export default router;