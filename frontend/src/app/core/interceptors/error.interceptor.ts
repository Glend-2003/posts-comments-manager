import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorMapperService } from '../services/error-mapper.service';
import { NotificationService } from '../services/notification.service';

//Interceptor de errores global 
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  const errorMapper = inject(ErrorMapperService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = errorMapper.toUserMessage(error);
      notifications.showError(message);
      return throwError(() => error);
    }),
  );
};
