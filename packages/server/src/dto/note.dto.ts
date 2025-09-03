import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, IsUUID } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({ minLength: 3 })
  @IsString()
  @Length(3, 255)
  title!: string;

  @ApiProperty()
  @IsString()
  content!: string;

  @ApiPropertyOptional({ description: 'Vincular a um projeto existente' })
  @IsOptional()
  @IsUUID()
  projectId?: string;
}

export class UpdateNoteDto {
  @ApiPropertyOptional({ minLength: 3 })
  @IsOptional()
  @IsString()
  @Length(3, 255)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projectId?: string;
}
