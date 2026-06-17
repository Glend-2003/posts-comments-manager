import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Comment } from '../../../../core/models/comment.model';

@Component({
  selector: 'app-comment-list',
  imports: [DatePipe],
  templateUrl: './comment-list.html',
})
export class CommentList {
  readonly comments = input<Comment[]>([]);

  // dejo que el padre haga el deleteComment de verdad
  readonly delete = output<Comment>();

  onDelete(comment: Comment): void {
    const ok = confirm(`¿Eliminar el comentario de ${comment.name}?`);
    if (ok) {
      this.delete.emit(comment);
    }
  }
}
