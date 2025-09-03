import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { Project } from './entities/project.entity';
import { Note } from './entities/note.entity';
import { User } from './entities/user.entity';
import { IdempotencyKey } from './entities/idempotency-key.entity';

import { ProjectController } from './controllers/project.controller';
import { NoteController } from './controllers/note.controller';
import { AuthController } from './controllers/auth.controller';

import { ProjectService } from './services/project.service';
import { NoteService } from './services/note.service';
import { AuthService } from './services/auth.service';

import { IdempotencyInterceptor } from './interceptors/idempotency.interceptor';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.TYPEORM_HOST ?? 'localhost',
        port: +(process.env.TYPEORM_PORT ?? 5432),
        username: process.env.TYPEORM_USERNAME ?? 'billor',
        password: process.env.TYPEORM_PASSWORD ?? 'billor',
        database: process.env.TYPEORM_DATABASE ?? 'billor_db',
        autoLoadEntities: true,
        synchronize: false,
        migrations: ['dist/orm/migrations/*.js'],
      }),
    }),
    TypeOrmModule.forFeature([Project, Note, User, IdempotencyKey]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [ProjectController, NoteController, AuthController],
  providers: [
    ProjectService,
    NoteService,
    AuthService,
    JwtStrategy,
    { provide: APP_INTERCEPTOR, useClass: IdempotencyInterceptor },
  ],
})
export class AppModule {}
