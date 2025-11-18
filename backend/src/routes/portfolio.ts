import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../ormconfig';
import { authenticate, authorizeAdvisor } from '../middleware/auth';
import { generateSignals } from '../services/advisoryEngine';
import { Portfolio } from '../entities/Portfolio';
import { Client } from '../entities/Client';

const router = Router();

router.use(authenticate, authorizeAdvisor);

// Create portfolio
router.post('/', async (req: Request, res: Response) => {
  const { name, clientId } = req.body;
  const portfolioRepo = AppDataSource.getRepository(Portfolio);
  const clientRepo = AppDataSource.getRepository(Client);
  const client = await clientRepo.findOne({ where: { id: clientId } });
  if (!client) {
    return res.status(400).json({ message: 'Client not found' });
  }
  const portfolio = portfolioRepo.create({ name, client });
  await portfolioRepo.save(portfolio);
  res.status(201).json(portfolio);
});

// Get all portfolios (advisor view)
router.get('/', async (req: Request, res: Response) => {
  const portfolioRepo = AppDataSource.getRepository(Portfolio);
  const portfolios = await portfolioRepo.find({ relations: ['client', 'holdings'] });
  res.json(portfolios);
});

// Get signals for a portfolio
router.get('/:id/signals', async (req: Request, res: Response) => {
  const portfolioId = Number(req.params.id);
  if (isNaN(portfolioId)) {
    return res.status(400).json({ message: 'Invalid portfolio ID' });
  }
  const signals = await generateSignals(portfolioId);
  res.json(signals);
});

export default router;