import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Subject, catchError, delay, of, switchMap, tap } from 'rxjs';

import { Post } from '../../../../core/models/post.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { PostsService } from '../../services/posts.service';
import { Modal } from '../../../../shared/components/modal/modal';
import { PostForm } from '../../components/post-form/post-form';

@Component({
  selector: 'app-posts-list',
  imports: [DatePipe, Modal, PostForm],
  templateUrl: './posts-list.html',
})
export class PostsList implements OnInit {
  private readonly postsService = inject(PostsService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

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

  //Elimina un post previa confirmación.
  deletePost(post: Post): void {
    const confirmado = confirm(`¿Eliminar el post "${post.title}"? Esta acción no se puede deshacer.`);
    if (!confirmado) {
      return;
    }

    this.postsService
      .deletePost(post._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notification.showSuccess('Post eliminado correctamente.');
          this.loadPosts();
        },
        error: () => {},
      });
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

  // TODO: navegar a la pagina de detalle, para proxima funcion
  viewPost(post: Post): void {}
}
