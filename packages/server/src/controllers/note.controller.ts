import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, Request } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CursorQueryDto, IdParamDto, OptionalProjectFilterDto } from '../dto/common.dto';
import { CreateNoteDto, UpdateNoteDto } from '../dto/note.dto';
import { NoteService } from '../services/note.service';

@ApiTags('notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NoteController {
  constructor(private readonly service: NoteService) {}

  @Get()
  @ApiOkResponse({ description: 'List notes with cursor pagination (optionally filtered by projectId)' })
  list(@Query() q: CursorQueryDto & OptionalProjectFilterDto, @Request() req: any) {
    return this.service.list(q, req.user.id);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Create a note (requires projectId)' })
  create(@Body() dto: CreateNoteDto, @Request() req: any) {
    return this.service.create(dto, req.user.id);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Get a note by id' })
  getOne(@Param() p: IdParamDto, @Request() req: any) {
    return this.service.getOne(p.id, req.user.id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Partially update a note' })
  update(@Param() p: IdParamDto, @Body() dto: UpdateNoteDto, @Request() req: any) {
    return this.service.update(p.id, dto, req.user.id);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Delete a note' })
  remove(@Param() p: IdParamDto, @Request() req: any) {
    return this.service.remove(p.id, req.user.id);
  }
}
