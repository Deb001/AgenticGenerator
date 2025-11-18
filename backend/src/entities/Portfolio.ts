import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Client } from './Client';
import { Holding } from './Holding';

@Entity()
export class Portfolio {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @ManyToOne(() => Client, (client) => client.id)
  client!: Client;

  @OneToMany(() => Holding, (holding) => holding.portfolio, { cascade: true })
  holdings!: Holding[];
}