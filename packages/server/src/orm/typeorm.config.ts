import { DataSource } from 'typeorm';
import { Project } from '../entities/project.entity';
import { Note } from '../entities/note.entity';
import { User } from '../entities/user.entity';
import { IdempotencyKey } from '../entities/idempotency-key.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.TYPEORM_HOST ?? 'localhost',
  port: +(process.env.TYPEORM_PORT ?? 5432),
  username: process.env.TYPEORM_USERNAME ?? 'billor',
  password: process.env.TYPEORM_PASSWORD ?? 'billor',
  database: process.env.TYPEORM_DATABASE ?? 'billor_db',
  entities: [Project, Note, User, IdempotencyKey],
  migrations: ['src/orm/migrations/*.ts'],
  synchronize: false
});
