import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Nome do usuário' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Email do usuário' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Senha do usuário (mínimo 6 caracteres)' })
  @IsString()
  @MinLength(6)
  password!: string;
}

export class LoginDto {
  @ApiProperty({ description: 'Email do usuário' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Senha do usuário' })
  @IsString()
  password!: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'Token JWT de acesso' })
  access_token!: string;

  @ApiProperty({ description: 'Dados do usuário' })
  user!: {
    id: string;
    email: string;
    name: string;
  };
}
