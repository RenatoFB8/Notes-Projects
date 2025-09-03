import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('idempotency_keys')
@Index(['key', 'method', 'path'], { unique: true })
export class IdempotencyKey {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  key!: string;        // header "Idempotency-Key"

  @Column()
  method!: string;

  @Column()
  path!: string;

  @Column({ type: 'text' })
  requestHash!: string;

  @Column({ type: 'int' })
  responseStatus!: number;

  @Column({ type: 'jsonb' })
  responseBody!: unknown;

  @CreateDateColumn()
  createdAt!: Date;
}
