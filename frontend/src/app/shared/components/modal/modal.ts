import { Component, HostListener, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
})
export class Modal {
  // título de la cabecera y si el modal se muestra o no
  readonly title = input<string>('');
  readonly open = input<boolean>(false);

  readonly close = output<void>();


  private pointerDownOnOverlay = false;

  // cierro tambien con Escape
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) {
      this.close.emit();
    }
  }


  onOverlayMouseDown(event: MouseEvent): void {
    this.pointerDownOnOverlay = event.target === event.currentTarget;
  }


  onOverlayMouseUp(event: MouseEvent): void {
    if (this.pointerDownOnOverlay && event.target === event.currentTarget) {
      this.close.emit();
    }
    this.pointerDownOnOverlay = false;
  }

  onClose(): void {
    this.close.emit();
  }
}
