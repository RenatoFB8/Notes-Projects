import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EtagInterceptor } from './interceptors/etag.interceptor';
import { IdempotencyInterceptor } from './interceptors/idempotency.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: { origin: process.env.CORS_ORIGIN ?? '*' }});
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new EtagInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Projects & Notes API')
    .setDescription('Server-driven Projects & Notes with ETag, Idempotency, Cursor Pagination, Search')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, doc);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
