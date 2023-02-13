FROM node:15.2.1-alpine3.11

RUN apk --update add --no-cache poppler poppler-utils antiword git

ARG CI

RUN mkdir -p /opt/app
WORKDIR /opt/app
ADD . /opt/app
ENV NODE_ENV production
#RUN yarn set version berry && yarn set version 3.1
RUN yarn install
RUN yarn build:prod
CMD yarn run start:prod
