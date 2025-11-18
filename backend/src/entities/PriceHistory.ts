import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class PriceHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  symbol!: string;

  @Column('date')
  date!: string;

  @Column('decimal')
  close!: number;
}