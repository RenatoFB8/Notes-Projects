import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { RegisterDto, LoginDto, AuthResponseDto } from '../dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiCreatedResponse({ 
    description: 'Register a new user',
    type: AuthResponseDto 
  })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOkResponse({ 
    description: 'Authenticate an existing user',
    type: AuthResponseDto 
  })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }
}
