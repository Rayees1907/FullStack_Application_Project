FROM node:18-alpine

WORKDIR /app

#  Install curl for healthcheck
RUN apk add --no-cache curl

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD curl -f http://localhost:4000/health || exit 1

CMD ["npm", "start"]

