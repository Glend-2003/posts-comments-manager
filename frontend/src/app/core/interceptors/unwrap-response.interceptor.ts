import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';


//Este interceptor detecta el formato de las respuestas del backend y reemplaza el body de la respuesta por el contenido de `data`.
export const unwrapResponseInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map((event) => {
      if (event instanceof HttpResponse) {
        const body = event.body;

        const tieneWrapper =
          body !== null &&
          typeof body === 'object' &&
          'success' in body &&
          (body as { success: unknown }).success === true &&
          'data' in body;

        if (tieneWrapper) {
          return event.clone({ body: (body as { data: unknown }).data });
        }
      }
      return event;
    }),
  );
};
