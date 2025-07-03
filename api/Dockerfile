FROM node:24-alpine3.22 AS builder

LABEL org.opencontainers.image.source=http://github.com/fadibouch/cesi-zen

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

FROM node:24-alpine3.22 AS final


COPY --from=builder /app /app

WORKDIR /app

EXPOSE 3000

COPY entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

ENTRYPOINT ["entrypoint"]
CMD ["npm", "run", "dev"]