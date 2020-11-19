FROM node:12.16.1-alpine3.11

RUN apk --update add --no-cache poppler antiword

ARG CI

RUN mkdir -p /opt/app
WORKDIR /opt/app
ADD . /opt/app
ENV NODE_ENV production
RUN yarn install --prod
RUN yarn build:prod
CMD yarn run start:prod
