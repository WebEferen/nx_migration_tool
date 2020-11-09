FROM node:12-slim

WORKDIR /app

RUN apt-get update && \
    apt-get --no-install-recommends -y install ca-certificates libgit2-dev && \
    rm -rf /var/lib/apt/lists/*

COPY package.json .
COPY yarn.lock .

RUN yarn install --production --non-interactive
COPY dist dist

ENV APP_PORT "5002"
ENV SPREADJS_LICENCE_KEY $SPREADJS_LICENCE_KEY

CMD ["yarn", "start:prod"]

EXPOSE 5002
