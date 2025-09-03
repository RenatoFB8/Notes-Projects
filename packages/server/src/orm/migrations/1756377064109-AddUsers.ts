import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique, TableForeignKey } from 'typeorm';

export class AddUsers1756377064109 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.createTable(new Table({
      name: 'users',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, isNullable: false, default: 'gen_random_uuid()' },
        { name: 'email', type: 'varchar', isNullable: false },
        { name: 'password', type: 'varchar', isNullable: false },
        { name: 'name', type: 'varchar', isNullable: false },
        { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
      ],
      uniques: [new TableUnique({ columnNames: ['email'] })],
      indices: [new TableIndex({ name: 'IDX_users_email', columnNames: ['email'] })],
    }));

    // Add userId column to projects table
    await queryRunner.query(`ALTER TABLE "projects" ADD COLUMN "userId" uuid`);

    // Create foreign key constraint
    await queryRunner.createForeignKey('projects', new TableForeignKey({
      columnNames: ['userId'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    // Remove unique constraint on title (now unique per user)
    await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "UQ_projects_title"`);
    
    // Add composite unique constraint for title + userId
    await queryRunner.query(`
      ALTER TABLE "projects" ADD CONSTRAINT "UQ_projects_title_userId" 
      UNIQUE ("title", "userId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop composite unique constraint
    await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "UQ_projects_title_userId"`);
    
    // Re-add original unique constraint on title
    await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "UQ_projects_title" UNIQUE ("title")`);
    
    // Drop foreign key
    await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "FK_projects_userId"`);
    
    // Drop userId column
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "userId"`);
    
    // Drop users table
    await queryRunner.dropTable('users');
  }
}
