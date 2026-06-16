import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/utils/api.constants';
import { CreatePost, Post, UpdatePost } from '../../../core/models/post.model';

 //Con unwrapResponseInterceptor estos metodos reciben los datos directamente
@Injectable({ providedIn: 'root' })
export class PostsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/posts`;

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.baseUrl);
  }

  getPost(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.baseUrl}/${id}`);
  }

  createPost(payload: CreatePost): Observable<Post> {
    return this.http.post<Post>(this.baseUrl, payload);
  }

  updatePost(id: string, payload: UpdatePost): Observable<Post> {
    return this.http.put<Post>(`${this.baseUrl}/${id}`, payload);
  }

  deletePost(id: string): Observable<Post> {
    return this.http.delete<Post>(`${this.baseUrl}/${id}`);
  }


  //Inserción masiva (POST /posts/bulk).
  bulkCreate(posts: CreatePost[]): Observable<Post[]> {
    return this.http.post<Post[]>(`${this.baseUrl}/bulk`, posts);
  }
}
