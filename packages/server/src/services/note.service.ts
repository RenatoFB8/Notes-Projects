import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from '../entities/note.entity';
import { Project } from '../entities/project.entity';
import { CreateNoteDto, UpdateNoteDto } from '../dto/note.dto';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note) private readonly noteRepo: Repository<Note>,
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
  ) {}

  async list(params: { q?: string; cursor?: string; limit?: number; projectId?: string }, userId: string) {
    const { q, cursor, limit = 20, projectId } = params;

    const qb = this.noteRepo.createQueryBuilder('n')
      .leftJoinAndSelect('n.project','p')
      .leftJoinAndSelect('p.user', 'u');

    qb.where('u.id = :userId', { userId });

    if (projectId) {
      qb.andWhere('p.id = :projectId', { projectId });
    }
    if (q) {
      qb.andWhere('(n.title ILIKE :q OR n.content ILIKE :q)', { q: `%${q}%` });
    }
    if (cursor) {
      qb.andWhere('n."createdAt" < :cursor', { cursor: new Date(cursor) });
    }

    qb.orderBy('n."createdAt"', 'DESC').limit(limit + 1);

    const rows = await qb.getMany();
    const hasNext = rows.length > limit;
    const items = hasNext ? rows.slice(0, limit) : rows;
    const nextCursor = hasNext ? items[items.length - 1].createdAt.toISOString() : null;

    return { items, nextCursor };
  }

  async create(dto: CreateNoteDto, userId: string) {
    if (!dto.projectId) throw new BadRequestException('projectId is required');
    const project = await this.projectRepo.findOne({ 
      where: { id: dto.projectId, user: { id: userId } } 
    });
    if (!project) throw new NotFoundException('Project not found');

    const entity = this.noteRepo.create({ title: dto.title, content: dto.content, project });
    return this.noteRepo.save(entity);
  }

  async getOne(id: string, userId: string) {
    const found = await this.noteRepo.findOne({ 
      where: { id }, 
      relations: ['project', 'project.user'] 
    });
    if (!found || found.project.user.id !== userId) {
      throw new NotFoundException('Note not found');
    }
    return found;
  }

  async update(id: string, dto: UpdateNoteDto, userId: string) {
    const note = await this.noteRepo.findOne({ 
      where: { id }, 
      relations: ['project', 'project.user'] 
    });
    if (!note || note.project.user.id !== userId) {
      throw new NotFoundException('Note not found');
    }

    if (dto.projectId && (!note.project || dto.projectId !== note.project.id)) {
      const newProject = await this.projectRepo.findOne({ 
        where: { id: dto.projectId, user: { id: userId } } 
      });
      if (!newProject) throw new NotFoundException('Project not found');
      note.project = newProject;
    }

    if (dto.title !== undefined) note.title = dto.title;
    if (dto.content !== undefined) note.content = dto.content;

    return this.noteRepo.save(note);
  }

  async remove(id: string, userId: string) {
    const note = await this.noteRepo.findOne({ 
      where: { id }, 
      relations: ['project', 'project.user'] 
    });
    if (!note || note.project.user.id !== userId) {
      throw new NotFoundException('Note not found');
    }
    
    const res = await this.noteRepo.delete(id);
    return { ok: true };
  }
}
