# Étape 1 - Construction du frontend avec Vite
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers nécessaires
COPY package*.json ./
RUN npm install -g vite
RUN npm install

COPY . .

# Build de l'application
RUN npm run build

# Étape 2 - Serveur léger pour servir les fichiers buildés
FROM node:18-alpine AS runner

WORKDIR /app
RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]
