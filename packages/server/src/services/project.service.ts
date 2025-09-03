import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Project } from '../entities/project.entity';
import { Note } from '../entities/note.entity';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    @InjectRepository(Note) private readonly noteRepo: Repository<Note>,
  ) {}

  async list(params: { q?: string; cursor?: string; limit?: number }, userId: string) {
    const { q, cursor, limit = 20 } = params;

    const qb = this.projectRepo.createQueryBuilder('p');
    qb.where('p.user.id = :userId', { userId });
    
    if (q) {
      qb.andWhere('(p.title ILIKE :q OR p.description ILIKE :q)', { q: `%${q}%` });
    }
    if (cursor) {
      qb.andWhere('p."createdAt" < :cursor', { cursor: new Date(cursor) });
    }

    qb.orderBy('p."createdAt"', 'DESC').limit(limit + 1);

    const rows = await qb.getMany();
    const hasNext = rows.length > limit;
    const items = hasNext ? rows.slice(0, limit) : rows;
    const nextCursor = hasNext ? items[items.length - 1].createdAt.toISOString() : null;

    return { items, nextCursor };
  }

  async create(dto: CreateProjectDto, userId: string) {
    const exists = await this.projectRepo.findOne({ 
      where: { title: dto.title, user: { id: userId } } 
    });
    if (exists) throw new BadRequestException('Project title already exists');

    const entity = this.projectRepo.create({ ...dto, user: { id: userId } });
    return this.projectRepo.save(entity);
  }

  async getOne(id: string, userId: string) {
    const found = await this.projectRepo.findOne({
      where: { id, user: { id: userId } },
      relations: ['notes'],
    });
    if (!found) throw new NotFoundException('Project not found');
    return found;
  }

  async update(id: string, dto: UpdateProjectDto, userId: string) {
    const found = await this.projectRepo.findOne({ 
      where: { id, user: { id: userId } } 
    });
    if (!found) throw new NotFoundException('Project not found');

    if (dto.title && dto.title !== found.title) {
      const exists = await this.projectRepo.findOne({ 
        where: { title: dto.title, user: { id: userId } } 
      });
      if (exists) throw new BadRequestException('Project title already exists');
    }

    Object.assign(found, dto);
    return this.projectRepo.save(found);
  }

  async remove(id: string, userId: string) {
    const found = await this.projectRepo.findOne({ 
      where: { id, user: { id: userId } } 
    });
    if (!found) throw new NotFoundException('Project not found');
    
    const res = await this.projectRepo.delete(id);
    return { ok: true };
  }

  async createNote(projectId: string, note: { title: string; content: string }, userId: string) {
    const project = await this.projectRepo.findOne({ 
      where: { id: projectId, user: { id: userId } } 
    });
    if (!project) throw new NotFoundException('Project not found');

    const entity = this.noteRepo.create({ ...note, project });
    return this.noteRepo.save(entity);
  }
}
