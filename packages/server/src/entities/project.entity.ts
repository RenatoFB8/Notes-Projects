import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Note } from './note.entity';
import { User } from './user.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => Note, (note) => note.project, { cascade: true })
  notes!: Note[];

  @ManyToOne(() => User, (user) => user.projects, { onDelete: 'CASCADE' })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
