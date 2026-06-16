import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/utils/api.constants';
import { Comment, CreateComment } from '../../../core/models/comment.model';

 //Igual que PostsService, recibe datos ya reales por el interceptor.
@Injectable({ providedIn: 'root' })
export class CommentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/comments`;

  getCommentsByPost(postId: string): Observable<Comment[]> {
    const params = new HttpParams().set('postId', postId);
    return this.http.get<Comment[]>(this.baseUrl, { params });
  }

  createComment(payload: CreateComment): Observable<Comment> {
    return this.http.post<Comment>(this.baseUrl, payload);
  }

  deleteComment(id: string): Observable<Comment> {
    return this.http.delete<Comment>(`${this.baseUrl}/${id}`);
  }
}
