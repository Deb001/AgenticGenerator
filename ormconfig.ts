import { DataSource } from 'typeorm';
import { User } from './backend/src/entities/User';
import { Client } from './backend/src/entities/Client';
import { Portfolio } from './backend/src/entities/Portfolio';
import { Holding } from './backend/src/entities/Holding';
import { PriceHistory } from './backend/src/entities/PriceHistory';
import { AdvisorySignal } from './backend/src/entities/AdvisorySignal';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true, // set false in production and use migrations
  logging: false,
  entities: [User, Client, Portfolio, Holding, PriceHistory, AdvisorySignal],
});