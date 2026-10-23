FROM node:20-alpine
RUN apk add --no-cache python3 make g++
WORKDIR /usr/src/api-server
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
