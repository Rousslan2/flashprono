# Backend optimisé pour Railway
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copier package.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production --prefer-offline --no-audit

# Copier le code
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
