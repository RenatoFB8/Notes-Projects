import 'reflect-metadata';
import { AppDataSource } from './typeorm.config';
AppDataSource.initialize().then(() => {
  // no-op; TypeORM CLI calls this via ts-node
}).catch(console.error);