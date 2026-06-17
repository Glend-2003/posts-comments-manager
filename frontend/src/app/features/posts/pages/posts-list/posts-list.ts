import { Component, DestroyRef, OnInit, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, catchError, delay, of, switchMap, tap } from 'rxjs';

import { Post } from '../../../../core/models/post.model';
import { Comment } from '../../../../core/models/comment.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { PostsService } from '../../services/posts.service';
import { CommentsService } from '../../services/comments.service';
import { Modal } from '../../../../shared/components/modal/modal';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { PostForm } from '../../components/post-form/post-form';
import { TruncatePipe } from '../../../../shared/pipes/truncate-pipe';

@Component({
  selector: 'app-posts-list',
  imports: [DatePipe, Modal, ConfirmDialog, PostForm, TruncatePipe],
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

  // === Paginacion encima de filteredPosts
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);

  // total de paginas segun el resultado ya filtrado 
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredPosts().length / this.pageSize())),
  );

  // porcion visible, aplica la paginacion sobre filteredPosts
  readonly paginatedPosts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredPosts().slice(start, start + this.pageSize());
  });

  // === Estados de ui ===
  readonly loading = signal<boolean>(false);
  readonly loaded = signal<boolean>(false);
  private readonly reload$ = new Subject<void>();

  // estado del modal: si esta abierto y qué post edito (null = crear)
  readonly modalOpen = signal<boolean>(false);
  readonly editingPost = signal<Post | null>(null);

  // estado del confirmacion de borrrado
  readonly confirmOpen = signal<boolean>(false);
  readonly confirmMessage = signal<string>('');

  private readonly postToDelete = signal<Post | null>(null);

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

    // Red de seguridad: si tras filtrar o borrar la página actual queda
    // fuera de rango (ej: estabas en la pág. 3 y ahora solo hay 1), la
    // recolocamos dentro de [1, totalPages]. Cubre los casos que el reset
    // explícito de onSearch no abarca (p. ej. borrar el último de una página).
    effect(() => {
      const tp = this.totalPages();
      if (this.currentPage() > tp) {
        this.currentPage.set(tp);
      }
    });
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
    // al cambiar la búsqueda, volvemos a la primera página para no quedar
    // en una página que ya no existe tras filtrar
    this.currentPage.set(1);
  }

  // navegación de paginación (clamp dentro de rango por seguridad)
  goToPage(page: number): void {
    const target = Math.min(Math.max(1, page), this.totalPages());
    this.currentPage.set(target);
  }

  prevPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  // consulta cuandos comentarios tiene y abrir un dialogo dependiendo si tiene o no mensajes
  deletePost(post: Post): void {
    if (this.deleting()) {
      return;
    }

    this.commentsService
      .getCommentsByPost(post._id)
      // si falla es nul tira el mensaje de respaldo
      .pipe(
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((comments) => {
        this.postToDelete.set(post);
        this.confirmMessage.set(this.buildDeleteMessage(post, comments));
        this.confirmOpen.set(true);
      });
  }

  // Cuando el usuario confirma el dialogo se procede a borrar 
  onConfirmDelete(): void {
    const post = this.postToDelete();
    if (!post || this.deleting()) {
      return;
    }
    this.deleting.set(true);

    this.postsService
      .deletePost(post._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notification.showSuccess('Post eliminado correctamente.');
          this.loadPosts();
          this.closeConfirm();
          this.deleting.set(false);
        },
        error: () => {
          this.closeConfirm();
          this.deleting.set(false);
        },
      });
  }

  // Cancelar sin borrar
  closeConfirm(): void {
    this.confirmOpen.set(false);
    this.postToDelete.set(null);
    this.confirmMessage.set('');
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
