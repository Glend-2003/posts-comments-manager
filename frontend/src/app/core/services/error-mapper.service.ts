import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

//Convierte un HttpErrorResponse crudo en un mensaje claro
@Injectable({ providedIn: 'root' })
export class ErrorMapperService {
  //Devuelve un mensaje UI-friendly a partir del error HTTP
  toUserMessage(error: HttpErrorResponse): string {
    //servidor caido
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
    }

    // Mensaje que envía el backend en su envoltorio de error
    const backendMessage = this.extractBackendMessage(error);

    switch (error.status) {
      case 400:
      
        return backendMessage ?? 'La solicitud contiene datos inválidos.';

      case 401:
        return 'No estás autorizado para realizar esta acción.';

      case 403:
        return 'No tienes permisos para realizar esta acción.';

      case 404:
        return backendMessage ?? 'El recurso solicitado no existe o fue eliminado.';

      case 409:
        return backendMessage ?? 'Hay un conflicto con el estado actual del recurso.';

      case 500:
        return 'Ocurrió un error en el servidor. Inténtalo más tarde.';

      default:
        // Fallback generico
        return backendMessage ?? 'Ocurrió un error inesperado. Inténtalo de nuevo.';
    }
  }

   //Extrae error.error.message del envoltorio del backend
  private extractBackendMessage(error: HttpErrorResponse): string | null {
    const payload = error.error;

    if (payload && typeof payload === 'object' && 'message' in payload) {
      const message = (payload as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim().length > 0) {
        return message;
      }
      // Por si en algún caso llegara como array
      if (Array.isArray(message) && message.length > 0) {
        return message.join(', ');
      }
    }

    return null;
  }
}
