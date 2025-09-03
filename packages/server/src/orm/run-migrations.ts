import 'reflect-metadata';
import { AppDataSource } from './typeorm.config';

async function main() {
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();       // <- aqui executa de fato
  console.log('[typeorm] migrations applied');
  await AppDataSource.destroy();
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
