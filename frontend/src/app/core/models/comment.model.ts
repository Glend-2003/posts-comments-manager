/**
 * Representa un Comment tal y como lo devuelve el backend.
 */
export interface Comment {
  _id: string;
  postId: string;
  name: string;
  email: string;
  body: string;
  createdAt: string;
}

/** Payload para crear un Comment POST /comments. */
export interface CreateComment {
  postId: string;
  name: string;
  email: string;
  body: string;
}
