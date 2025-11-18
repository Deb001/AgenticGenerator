import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class AdvisorySignal {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  portfolioId!: number;

  @Column()
  symbol!: string;

  @Column()
  recommendation!: 'Buy' | 'Hold' | 'Sell';

  @Column('timestamp')
  generatedAt!: Date;
}