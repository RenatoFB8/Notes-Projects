import 'reflect-metadata';
import { AppDataSource } from './typeorm.config';

async function main() {
  await AppDataSource.initialize();
  await AppDataSource.undoLastMigration();
  console.log('[typeorm] last migration reverted');
  await AppDataSource.destroy();
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
