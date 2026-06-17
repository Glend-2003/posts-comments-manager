# Posts & Comments Manager

App full-stack de posts y comentarios con Angular 20, NestJS y MongoDB.

## Stack

Angular 20 · NestJS · MongoDB · Docker · Tailwind CSS

## Requisitos previos

Node, Docker, Angular CLI.

## Cómo correr el proyecto

Hay dos formas de levantar el backend, por docker y por individual, no se puede las 2 a la vez porque ambas corren en el mismo puerto `3000` 

### Modo A — Desarrollo local

Mongo en Docker, backend con npm (recarga al guardar):

```bash
# 1. levantar solo MongoDB
docker compose up -d mongodb

# 2. Backend con npm
cd backend
cp .env.example .env
npm install
npm run start:dev
```

Aquí el backend usa el `MONGODB_URI` del `.env` (con `localhost`).

### Modo B — Docker completo

Mongo + backend juntos en contenedores de docker:

```bash
# desde la raiz
docker compose up --build
```

El backend se conecta a Mongo por el nombre de servicio (`mongodb`), no por
`localhost`: el compose inyecta `MONGODB_URI=mongodb://mongodb:27017/posts_comments_db`,
que sobrescribe el del `.env` solo dentro de Docker.

### Frontend

```bash
cd frontend
npm install
npm start
```

## Puertos

| Servicio | Puerto |
|----------|--------|
| Backend  | 3000   |
| Frontend | 4200   |
| MongoDB  | 27017  |
