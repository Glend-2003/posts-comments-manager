import { Component, DestroyRef, computed, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CreatePost, Post } from '../../../../core/models/post.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { PostsService } from '../../services/posts.service';

@Component({
  selector: 'app-post-form',
  imports: [ReactiveFormsModule],
  templateUrl: './post-form.html',
})
export class PostForm {
  private readonly postsService = inject(PostsService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  // si llega un post estamos editando, si es null, creando
  readonly post = input<Post | null>(null);

  readonly saved = output<void>();
  readonly cancel = output<void>();

  readonly saving = signal(false);
  readonly isEdit = computed(() => this.post() !== null);

  // validaciones
  readonly form = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(3)]),
    body: new FormControl('', [Validators.required, Validators.minLength(10)]),
    author: new FormControl('', [Validators.required]),
  });

  constructor() {
    // cuando cambia el post de entrada, precargo el forms
    effect(() => {
      const post = this.post();
      if (post) {
        this.form.patchValue(post);
      } else {
        this.form.reset({ title: '', body: '', author: '' });
      }
    });
  }

  // helper para la plantilla: solo mostrar error si toco o modifico el campo
  showError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      return;
    }

    this.saving.set(true);
    const payload = this.form.getRawValue() as CreatePost;
    const current = this.post();

    const request$ = current
      ? this.postsService.updatePost(current._id, payload)
      : this.postsService.createPost(payload);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.notification.showSuccess(
          this.isEdit() ? 'Post actualizado correctamente.' : 'Post creado correctamente.',
        );
        this.saved.emit();
      },
      // el error lo notifica el interceptor; solo reactivo el boton
      error: () => this.saving.set(false),
    });
  }
}
