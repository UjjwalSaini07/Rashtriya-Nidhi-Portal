FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S rnp && adduser -S rnp -G rnp
COPY --chown=rnp:rnp --from=builder /app/node_modules ./node_modules
COPY --chown=rnp:rnp src ./src
COPY --chown=rnp:rnp package*.json ./
RUN mkdir -p uploads logs && chown rnp:rnp uploads logs
USER rnp
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD wget -qO- http://localhost:5000/health || exit 1
CMD ["node", "src/index.js"]
