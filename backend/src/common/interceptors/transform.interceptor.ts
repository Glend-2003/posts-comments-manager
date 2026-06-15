import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../responses/api-response';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        // Si el controller ya devolvió una respuesta con forma estándar
        // (ej: POST /posts/bulk), no la volvemos a envolver para evitar
        // un data.data anidado.
        if (
          data !== null &&
          typeof data === 'object' &&
          'success' in data
        ) {
          return data;
        }
        return ApiResponse.success(data);
      }),
    );
  }
}
