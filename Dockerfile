# ---------- Tahap 1: build frontend React ----------
FROM node:24-alpine AS client-build
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ---------- Tahap 2: backend Node.js + hasil build ----------
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    DB_PATH=/app/data/app.db

COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --omit=dev
COPY server/ ./server/
COPY --from=client-build /app/client/dist ./client/dist

EXPOSE 3000
VOLUME ["/app/data"]
CMD ["node", "--disable-warning=ExperimentalWarning", "server/src/index.js"]
