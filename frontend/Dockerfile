# Build optimisé pour Railway
FROM node:20-slim AS builder

WORKDIR /app

# Variables d'environnement
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Copier les fichiers de dépendances
COPY package.json .npmrc ./

# Installation des dépendances
RUN npm cache clean --force && \
    npm install --include=dev

# Copier le code source
COPY . .

# Build
RUN npm run build

# Image de production légère
FROM node:20-slim

WORKDIR /app

# Installer serve globalement
RUN npm install -g serve

# Copier uniquement le build depuis l'étape précédente
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "8080"]
