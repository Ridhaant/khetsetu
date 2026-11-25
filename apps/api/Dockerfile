FROM node:24-alpine AS build
WORKDIR /app
COPY package.json ./
COPY scripts ./scripts
COPY src ./src
RUN node scripts/build.mjs

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=development HOST=0.0.0.0 PORT=4000
COPY --from=build --chown=node:node /app/dist ./dist
USER node
EXPOSE 4000
CMD ["node", "dist/server.js"]
