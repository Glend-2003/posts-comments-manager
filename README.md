# Posts & Comments Manager

App full-stack de posts y comentarios con Angular 20, NestJS y MongoDB.

## Stack

Angular 20 · NestJS · MongoDB · Docker · Tailwind CSS

## Requisitos previos

Node, Docker, Angular CLI.

## Cómo correr el proyecto

1. **MongoDB** (desde la raíz):
   ```bash
   docker compose up -d
   ```
2. **Backend**:
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run start:dev
   ```
3. **Frontend**:
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
