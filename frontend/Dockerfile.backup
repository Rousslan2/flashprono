# Build optimisé pour Railway
FROM node:18-alpine AS builder

WORKDIR /app

# Variables d'environnement pour optimiser le build
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances (avec timeout augmenté)
RUN npm ci --prefer-offline --no-audit --progress=false

# Copier le code source
COPY . .

# Build
RUN npm run build

# Image de production légère
FROM node:18-alpine

WORKDIR /app

# Installer serve
RUN npm install -g serve

# Copier le build
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "8080"]
