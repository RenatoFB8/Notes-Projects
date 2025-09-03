import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Project } from './project.entity';

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @ManyToOne(() => Project, (project) => project.notes, { onDelete: 'CASCADE' })
  project!: Project;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
