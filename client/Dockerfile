FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S rnp && adduser -S rnp -G rnp
COPY --chown=rnp:rnp --from=builder /app/.next/standalone ./
COPY --chown=rnp:rnp --from=builder /app/.next/static ./.next/static
COPY --chown=rnp:rnp --from=builder /app/public ./public
USER rnp
EXPOSE 3000
CMD ["node", "server.js"]
