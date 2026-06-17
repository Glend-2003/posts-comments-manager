import { Component, input, output } from '@angular/core';

import { Modal } from '../modal/modal';

@Component({
  selector: 'app-confirm-dialog',
  imports: [Modal],
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  readonly open = input<boolean>(false);
  readonly title = input<string>('');
  readonly message = input<string>('');
  readonly confirmText = input<string>('Confirmar');
  readonly cancelText = input<string>('Cancelar');
  readonly danger = input<boolean>(false);

  readonly confirm = output<void>();
  readonly cancel = output<void>();

  onClose(): void {
    this.cancel.emit();
  }
}
