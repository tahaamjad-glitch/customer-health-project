FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4174
ENV PROJECT_DOMAIN=www.projecthealth.com
ENV PUBLIC_ORIGIN=https://www.projecthealth.com
ENV CANONICAL_ORIGIN=https://www.projecthealth.com
ENV ALLOWED_ORIGINS=https://www.projecthealth.com
ENV COOKIE_DOMAIN=.projecthealth.com
ENV COOKIE_SECURE=true

COPY package.json ./
COPY server.js index.html script.js styles.css README.md ./
COPY assets ./assets

RUN mkdir -p data

EXPOSE 4174
VOLUME ["/app/data"]

CMD ["node", "server.js"]
