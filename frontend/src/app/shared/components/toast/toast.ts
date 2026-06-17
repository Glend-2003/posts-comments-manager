import { Component, inject } from '@angular/core';

import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.html',
  styles: [
    `
      :host {
        display: contents;
      }
      .toast-enter {
        animation: toast-in 220ms ease-out;
      }
      @keyframes toast-in {
        from {
          opacity: 0;
          transform: translateY(-0.5rem) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `,
  ],
})
export class Toast {
  private readonly notificationService = inject(NotificationService);

  readonly notification = this.notificationService.notification;

  close(): void {
    this.notificationService.clear();
  }
}
