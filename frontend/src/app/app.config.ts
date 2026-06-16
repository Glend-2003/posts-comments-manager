import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { unwrapResponseInterceptor } from './core/interceptors/unwrap-response.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // El orden importa (ver explicación en el README/notas):
    // - En la PETICIÓN se ejecutan en este orden: error → unwrap.
    // - En la RESPUESTA se ejecutan en orden INVERSO: unwrap → error.
    // Así el unwrap desenvuelve la respuesta exitosa primero, y el error
    // queda "por fuera" para capturar fallos de toda la cadena.
    provideHttpClient(
      withInterceptors([errorInterceptor, unwrapResponseInterceptor]),
    ),
  ]
};
