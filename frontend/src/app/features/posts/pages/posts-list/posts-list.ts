import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { EMPTY, Subject, catchError, delay, of, switchMap, tap } from 'rxjs';

import { Post } from '../../../../core/models/post.model';
import { Comment } from '../../../../core/models/comment.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { PostsService } from '../../services/posts.service';
import { CommentsService } from '../../services/comments.service';
import { Modal } from '../../../../shared/components/modal/modal';
import { PostForm } from '../../components/post-form/post-form';

@Component({
  selector: 'app-posts-list',
  imports: [DatePipe, Modal, PostForm],
  templateUrl: './posts-list.html',
})
export class PostsList implements OnInit {
  private readonly postsService = inject(PostsService);
  private readonly commentsService = inject(CommentsService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  // === Signals - Nombres exactos
  readonly posts = signal<Post[]>([]);
  readonly search = signal<string>('');
  readonly filteredPosts = computed(() =>
    this.posts().filter((p) =>
      p.title.toLowerCase().includes(this.search().toLowerCase()),
    ),
  );

  // === Estados de ui ===
  readonly loading = signal<boolean>(false);
  readonly loaded = signal<boolean>(false);
  private readonly reload$ = new Subject<void>();

  // estado del modal: si esta abierto y qué post edito (null = crear)
  readonly modalOpen = signal<boolean>(false);
  readonly editingPost = signal<Post | null>(null);

  // evita doble click en eliminar mientras la operación está en curso
  readonly deleting = signal<boolean>(false);

  constructor() {
    // Tuberia reactiva de carga. Se suscribe una sola vez (vive lo que viva el componente, gracias a takeUntilDestroyed) y reacciona a cada reload$.
    this.reload$
      .pipe(
        // tap: efecto secundario enciende el loading antes de pedir los datos
        tap(() => this.loading.set(true)),
        // switchMap: cambia al Observable de la petición. Si llega otro reload$ mientras una petición sigue viva, cancela la anterior y se queda solo con la ultima.
        switchMap(() =>
          this.postsService.getPosts().pipe(
            // delay: retraso pequeño para que el spinner se pueda ver
            delay(300),
            // catchError dentro del switchMap: el interceptor global ya notifico al usuario; aqui solo evitamos que el error mate el stream exterior
            catchError(() => {
              this.loading.set(false);
              this.loaded.set(true);
              return of<Post[]>([]);
            }),
          ),
        ),
        // tap final: ya tenemos respuesta de exito ahora apaga el loading y marcar que hubo al menos una carga completada.
        tap(() => {
          this.loading.set(false);
          this.loaded.set(true);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      // se vuelca el array recibido a la signal posts con set().
      .subscribe((posts) => this.posts.set(posts));
  }

  ngOnInit(): void {
    this.loadPosts();
  }

  //Dispara una recarga de la lista.
  loadPosts(): void {
    this.reload$.next();
  }

  //Actualiza el termino de busqueda filtrado en cliente via computed.
  onSearch(value: string): void {
    this.search.set(value);
  }

  // Elimina un post avisando cuantos comentarios tiene
  deletePost(post: Post): void {
    if (this.deleting()) {
      return;
    }
    this.deleting.set(true);

    //1 contamos los comentarios. Si falla, devolvemos null para caer en el un fallback
    this.commentsService
      .getCommentsByPost(post._id)
      .pipe(
        catchError(() => of(null)),
        // 2 montamos el mensaje segun el conteo y pedimos confirmacion, si confirma, encadenamos el borrado; si no, se deja em EMPTY   
        switchMap((comments) => {
          const confirmado = confirm(this.buildDeleteMessage(post, comments));
          if (!confirmado) {
            return EMPTY;
          }
          return this.postsService.deletePost(post._id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.notification.showSuccess('Post eliminado correctamente.');
          this.loadPosts();
          this.deleting.set(false);
        },
        error: () => this.deleting.set(false),
        // se completa sin emitir cuando el usuario cancela 
        complete: () => this.deleting.set(false),
      });
  }

  // Mensaje diferenciado: comments null = no se pudo contar
  private buildDeleteMessage(post: Post, comments: Comment[] | null): string {
    if (comments === null) {
      return '¿Seguro que deseas eliminar este post? Sus comentarios asociados también se eliminarán.';
    }
    const n = comments.length;
    if (n === 0) {
      return `¿Seguro que deseas eliminar el post "${post.title}"? Esta acción no se puede deshacer.`;
    }
    const plural = n === 1 ? 'comentario asociado' : 'comentarios asociados';
    return `El post "${post.title}" tiene ${n} ${plural} que también se eliminarán. ¿Deseas continuar?`;
  }

  // abrir modal en modo crear
  addPost(): void {
    this.editingPost.set(null);
    this.modalOpen.set(true);
  }

  // abrir modal en modo editar con el post de la fila
  editPost(post: Post): void {
    this.editingPost.set(post);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingPost.set(null);
  }

  // el formulario termino: cierro y recargo
  onSaved(): void {
    this.closeModal();
    this.loadPosts();
  }

  // navega al detalle del post
  viewPost(post: Post): void {
    this.router.navigate(['/posts', post._id]);
  }
}
