import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, Request } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CursorQueryDto, IdParamDto } from '../dto/common.dto';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';
import { CreateNoteDto } from '../dto/note.dto';
import { ProjectService } from '../services/project.service';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly service: ProjectService) {}

  @Get()
  @ApiOkResponse({ description: 'List projects with cursor pagination' })
  list(@Query() q: CursorQueryDto, @Request() req: any) {
    return this.service.list(q, req.user.id);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Create a project' })
  create(@Body() dto: CreateProjectDto, @Request() req: any) {
    return this.service.create(dto, req.user.id);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Get a project by id' })
  getOne(@Param() p: IdParamDto, @Request() req: any) {
    return this.service.getOne(p.id, req.user.id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Partially update a project' })
  update(@Param() p: IdParamDto, @Body() dto: UpdateProjectDto, @Request() req: any) {
    return this.service.update(p.id, dto, req.user.id);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Delete a project (cascade to notes)' })
  remove(@Param() p: IdParamDto, @Request() req: any) {
    return this.service.remove(p.id, req.user.id);
  }

  @Post(':id/notes')
  @ApiCreatedResponse({ description: 'Create a note linked to the project' })
  createNote(@Param() p: IdParamDto, @Body() dto: CreateNoteDto, @Request() req: any) {
    return this.service.createNote(p.id, { title: dto.title, content: dto.content }, req.user.id);
  }
}
