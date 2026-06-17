import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Comment } from '../../../../core/models/comment.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { CommentsService } from '../../services/comments.service';

@Component({
  selector: 'app-comment-form',
  imports: [ReactiveFormsModule],
  templateUrl: './comment-form.html',
})
export class CommentForm {
  private readonly commentsService = inject(CommentsService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly postId = input.required<string>();

  // emito el comentario ya creado con _id y createdAt del backend
  readonly commentCreated = output<Comment>();

  readonly saving = signal(false);

  readonly form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    body: new FormControl('', [Validators.required, Validators.minLength(2)]),
  });

  showError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      return;
    }

    this.saving.set(true);
    const payload = { postId: this.postId(), ...this.form.getRawValue() } as {
      postId: string;
      name: string;
      email: string;
      body: string;
    };

    this.commentsService
      .createComment(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (comment) => {
          this.saving.set(false);
          this.notification.showSuccess('Comentario publicado.');
          this.commentCreated.emit(comment);
          this.form.reset({ name: '', email: '', body: '' });
        },
        error: () => this.saving.set(false),
      });
  }
}
