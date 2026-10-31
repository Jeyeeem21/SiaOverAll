FROM node:20-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/api-server
COPY api-server/package*.json ./
RUN npm ci --omit=dev
COPY api-server/ ./
RUN rm -rf node_modules && npm ci --omit=dev

EXPOSE 3002
CMD ["npm", "start"]
