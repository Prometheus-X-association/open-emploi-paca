FROM node:16.19.0-alpine3.16

RUN apk --update add --no-cache poppler poppler-utils antiword git

ARG CI

RUN mkdir -p /opt/app
WORKDIR /opt/app
ADD . /opt/app
ENV NODE_ENV production
RUN yarn install
RUN yarn build:prod
CMD yarn run start:prod
