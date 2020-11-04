FROM node:12-slim

WORKDIR /app

RUN apt-get update && \
    apt-get --no-install-recommends -y install ca-certificates libgit2-dev && \
    rm -rf /var/lib/apt/lists/*

COPY package.json .
COPY yarn.lock .

RUN yarn install --production --non-interactive
COPY dist dist

ENV APP_PORT "3000"
ENV GIT_USERNAME $GIT_USERNAME
ENV GIT_PASSWORD $GIT_PASSWORD
ENV BASIC_AUTH_USER $BASIC_AUTH_USER
ENV BASIC_AUTH_PASS $BASIC_AUTH_PASS

CMD ["yarn", "start:prod"]

EXPOSE 3000
