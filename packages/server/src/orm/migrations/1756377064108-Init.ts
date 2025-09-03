// src/orm/migrations/1710000000000-Init.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique } from 'typeorm';

export class Init1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // habilita pgcrypto (fornece gen_random_uuid)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // projects
    await queryRunner.createTable(new Table({
      name: 'projects',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, isNullable: false, default: 'gen_random_uuid()' },
        { name: 'title', type: 'varchar', isNullable: false },
        { name: 'description', type: 'text', isNullable: true },
        { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
      ],
      uniques: [ new TableUnique({ columnNames: ['title'] }) ],
    }));

    // notes
    await queryRunner.createTable(new Table({
      name: 'notes',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, isNullable: false, default: 'gen_random_uuid()' },
        { name: 'title', type: 'varchar', isNullable: false },
        { name: 'content', type: 'text', isNullable: false },
        { name: 'projectId', type: 'uuid', isNullable: false },
        { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
      ],
      foreignKeys: [
        {
          columnNames: ['projectId'],
          referencedTableName: 'projects',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        },
      ],
    }));
    await queryRunner.createIndex('notes', new TableIndex({ name: 'IDX_notes_title', columnNames: ['title'] }));

    // idempotency_keys
    await queryRunner.createTable(new Table({
      name: 'idempotency_keys',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, isNullable: false, default: 'gen_random_uuid()' },
        { name: 'key', type: 'varchar', isNullable: false },
        { name: 'method', type: 'varchar', isNullable: false },
        { name: 'path', type: 'varchar', isNullable: false },
        { name: 'requestHash', type: 'text', isNullable: false },
        { name: 'responseStatus', type: 'int', isNullable: false },
        { name: 'responseBody', type: 'jsonb', isNullable: false },
        { name: 'createdAt', type: 'timestamptz', default: 'now()' },
      ],
      indices: [ new TableIndex({ name: 'IDX_idemp_key', columnNames: ['key'] }) ],
      uniques: [ new TableUnique({ name: 'UQ_idemp_key_method_path', columnNames: ['key', 'method', 'path'] }) ],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('idempotency_keys');
    await queryRunner.dropIndex('notes', 'IDX_notes_title');
    await queryRunner.dropTable('notes');
    await queryRunner.dropTable('projects');
  }
}
