# 1 el build instala todo node 24, node 20  falla por diferencias en cómo cada versión valida las dependencias
FROM node:24-alpine AS builder

WORKDIR /app

# mientras package.json no cambie no se reinstalan dependencias
COPY package*.json ./
RUN npm ci

# se copia el resto del codigo y compilamos a dist/
COPY . .
RUN npm run build

# 2 produccion imagen liviana
FROM node:24-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

# solo dependencias de producción 
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# traemos solo el build anterior
COPY --from=builder /app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/main"]
