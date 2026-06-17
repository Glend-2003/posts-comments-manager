import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';

import { Post } from '../../../../core/models/post.model';
import { Comment } from '../../../../core/models/comment.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { PostsService } from '../../services/posts.service';
import { CommentsService } from '../../services/comments.service';
import { CommentList } from '../../components/comment-list/comment-list';
import { CommentForm } from '../../components/comment-form/comment-form';

@Component({
  selector: 'app-post-detail',
  imports: [DatePipe, RouterLink, CommentList, CommentForm],
  templateUrl: './post-detail.html',
})
export class PostDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly postsService = inject(PostsService);
  private readonly commentsService = inject(CommentsService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly post = signal<Post | null>(null);
  readonly loading = signal<boolean>(true);
  readonly notFound = signal<boolean>(false);

  readonly comments = signal<Comment[]>([]);
  readonly commentsLoading = signal<boolean>(false);

  constructor() {
    // aqui se lee el id de la ruta y con switchMap pido el post, si el id cambia, switchMap cancela la petición anterior.
    this.route.paramMap
      .pipe(
        map((params) => params.get('id') ?? ''),
        tap(() => {
          this.loading.set(true);
          this.notFound.set(false);
        }),
        switchMap((id) =>
          this.postsService.getPost(id).pipe(
            // si el backend responde 404 (u otro error) marco no encontrado se devuelve null para no romper el stream
            catchError(() => {
              this.notFound.set(true);
              return of<Post | null>(null);
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((post) => {
        this.loading.set(false);
        this.post.set(post);
        if (post) {
          this.loadComments(post._id);
        }
      });
  }

  private loadComments(postId: string): void {
    this.commentsLoading.set(true);
    this.commentsService
      .getCommentsByPost(postId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (comments) => {
          this.comments.set(comments);
          this.commentsLoading.set(false);
        },
        error: () => this.commentsLoading.set(false),
      });
  }

  // Aqui se actualiza instantaneamente porque el backend registro y devuelve el id y el createdAt sin tener que pedir nada 
  onCommentCreated(comment: Comment): void {
    this.comments.update((list) => [comment, ...list]);
  }

  onDeleteComment(comment: Comment): void {
    this.commentsService
      .deleteComment(comment._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notification.showSuccess('Comentario eliminado.');
          this.comments.update((list) => list.filter((c) => c._id !== comment._id));
        },
        error: () => {},
      });
  }
}
