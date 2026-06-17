import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe puro reutilizable que recorta un texto a una longitud maxima
 */
@Pipe({
  name: 'truncate',
})
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, limit = 100, suffix = '…'): string {
    // Casos borde null 
    if (value == null) {
      return '';
    }

    const text = String(value);

    // Si es mas corto o igual al limite, se devuelve tal cual viene
    if (text.length <= limit) {
      return text;
    }

    // Recorta al limite
    return text.slice(0, limit).trimEnd() + suffix;
  }
}
