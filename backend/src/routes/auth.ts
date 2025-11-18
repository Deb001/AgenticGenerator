import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../ormconfig';
import { User } from '../entities/User';
import { signJwt } from '../utils/jwt';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const valid = await user.comparePassword(password);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = signJwt({ sub: user.id, role: user.role });
  res.json({ token });
});

export default router;