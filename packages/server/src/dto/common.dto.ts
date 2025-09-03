import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsInt, IsOptional, IsPositive, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CursorQueryDto {
  @ApiPropertyOptional({ description: 'Busca textual (ILIKE em campos suportados)' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Cursor (ISO date) para paginação', example: '2024-01-01T12:00:00.000Z' })
  @IsOptional()
  @IsISO8601()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Tamanho da página', default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class IdParamDto {
  @IsUUID()
  id!: string;
}

export class ProjectIdParamDto {
  @IsUUID()
  projectId!: string;
}

export class OptionalProjectFilterDto {
  @ApiPropertyOptional({ description: 'Filtra por projectId' })
  @IsOptional()
  @IsUUID()
  projectId?: string;
}
