import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error';

export interface Notification {
  type: NotificationType;
  message: string;
}

/**
 Estado global de notificaciones=
*/
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private static readonly AUTO_DISMISS_MS = 4000;


  private readonly _notification = signal<Notification | null>(null);

  readonly notification = this._notification.asReadonly();

  private dismissTimer: ReturnType<typeof setTimeout> | null = null;

  showSuccess(message: string): void {
    this.show({ type: 'success', message });
  }

  showError(message: string): void {
    this.show({ type: 'error', message });
  }

  clear(): void {
    this.cancelTimer();
    this._notification.set(null);
  }

  private show(notification: Notification): void {
    this.cancelTimer();
    this._notification.set(notification);
    this.dismissTimer = setTimeout(
      () => this.clear(),
      NotificationService.AUTO_DISMISS_MS,
    );
  }

  private cancelTimer(): void {
    if (this.dismissTimer !== null) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
  }
}
