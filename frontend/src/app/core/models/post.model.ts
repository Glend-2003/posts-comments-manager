/**
 * Representa un Post tal y como lo devuelve el backend).
 */
export interface Post {
  _id: string;
  title: string;
  body: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

/** Payload para crear un Post POST /posts*/
export interface CreatePost {
  title: string;
  body: string;
  author: string;
}

/**
 * Payload para actualizar un Post PUT /posts/:id.
 */
export type UpdatePost = Partial<CreatePost>;
