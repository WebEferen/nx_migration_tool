FROM node:16.0.0-buster-slim

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY .yarnrc .

RUN yarn install --production --non-interactive

COPY dist dist

ENV NODE_ENV "prod"
ENV APP_PORT "5002"
ENV AUTH_METHOD=
ENV BASIC_AUTH_USER=
ENV BASIC_AUTH_PASS=
ENV SPREADJS_LICENCE_KEY=

CMD ["yarn", "start:prod"]

EXPOSE 5002
