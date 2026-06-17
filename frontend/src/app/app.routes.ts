import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'posts',
    loadComponent: () =>
      import('./features/posts/pages/posts-list/posts-list').then((m) => m.PostsList),
  },
  {
    path: 'posts/:id',
    loadComponent: () =>
      import('./features/posts/pages/post-detail/post-detail').then((m) => m.PostDetail),
  },
  // Ruta por defecto -> listado de posts.
  { path: '', redirectTo: 'posts', pathMatch: 'full' },
  // Cualquier ruta desconocida vuelve al listado.
  { path: '**', redirectTo: 'posts' },
];
