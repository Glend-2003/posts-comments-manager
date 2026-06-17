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

  //la pagina de detalle confirma y hace el borrado de verdad
  readonly delete = output<Comment>();
}
