/**
 * Forma del envoltorio con el que el backend NestJS envuelve todas las respuestas exitosas
 */
export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  [extra: string]: unknown;
}

/**
 * Forma del envoltorio de error del backend
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  status: number;
  timestamp?: string;
  path?: string;
}
