import { type CallHandler, type ExecutionContext, Injectable, type NestInterceptor } from '@nestjs/common';
import { createHash } from 'crypto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class EtagInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req = ctx.switchToHttp().getRequest();
    const res = ctx.switchToHttp().getResponse();
    const clientETag = req.headers['if-none-match'];

    return next.handle().pipe(
      map((data) => {
        const body = typeof data === 'string' ? data : JSON.stringify(data);
        const etag = createHash('sha1').update(body).digest('hex');
        res.setHeader('ETag', etag);

        if (clientETag && clientETag === etag) {
          res.status(304);
          return undefined;
        }
        return data;
      })
    );
  }
}
