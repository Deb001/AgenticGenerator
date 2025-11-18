import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Portfolio } from './Portfolio';

@Entity()
export class Holding {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  symbol!: string;

  @Column('int')
  quantity!: number;

  @ManyToOne(() => Portfolio, (portfolio) => portfolio.holdings)
  portfolio!: Portfolio;
}