# Etapa 1: Construcción (Build)
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar configuraciones de paquetes y workspaces
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

# Instalar dependencias completas
RUN npm ci

# Copiar el código fuente completo
COPY . .

# Compilar frontend React + Vite
RUN npm run build

# Etapa 2: Imagen Final de Producción (Ligera y Rápida)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Copiar manifiestos
COPY package.json package-lock.json ./
COPY server/package.json ./server/

# Instalar solo dependencias necesarias para el servidor
RUN npm ci --omit=dev --workspace=server

# Copiar código del servidor y los archivos compilados del cliente
COPY server/ ./server/
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 4000

CMD ["npm", "run", "start"]
