import { type CallHandler, type ExecutionContext, Injectable, type NestInterceptor, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdempotencyKey } from '../entities/idempotency-key.entity';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createHash } from 'crypto';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(@InjectRepository(IdempotencyKey) private repo: Repository<IdempotencyKey>) {}

  async intercept(ctx: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = ctx.switchToHttp().getRequest();
    const res = ctx.switchToHttp().getResponse();
    const method = req.method;
    if (!['POST','PUT','PATCH','DELETE'].includes(method)) {
      return next.handle();
    }

    const path = req.originalUrl ?? req.url;
    
    // Skip idempotency for auth endpoints
    if (path.startsWith('/auth/')) {
      return next.handle();
    }

    const key = req.headers['idempotency-key'];
    if (!key || typeof key !== 'string') {
      // opcional: forçar header em métodos não-idempotentes
      throw new BadRequestException('Missing Idempotency-Key header');
    }

    const bodyStr = JSON.stringify(req.body ?? {});
    const requestHash = createHash('sha256').update(method + path + bodyStr).digest('hex');

    const existing = await this.repo.findOne({ where: { key, method, path } });
    if (existing) {
      res.status(existing.responseStatus);
      return new Observable((subscriber) => {
        subscriber.next(existing.responseBody);
        subscriber.complete();
      });
    }

    return next.handle().pipe(
      map(async (responseBody) => {
        const entry = this.repo.create({
          key, method, path, requestHash,
          responseStatus: res.statusCode || 200,
          responseBody
        });
        try {
          await this.repo.save(entry);
        } catch (e) {
          // corrida: se outra request salvou antes, devolva a existente
          const again = await this.repo.findOne({ where: { key, method, path } });
          if (again) return again.responseBody;
        }
        return responseBody;
      })
    ) as unknown as Observable<any>;
  }
}
