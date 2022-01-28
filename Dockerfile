# Copyright (C) 2022 Edge Network Technologies Limited
# Use of this source code is governed by a GNU GPL-style license
# that can be found in the LICENSE.md file. All rights reserved.

#
# 1. Build the Vue app
#
FROM node:lts AS build

ARG VUE_APP_ACCOUNT_API_URL
ENV VUE_APP_ACCOUNT_API_URL=$ACCOUNT_API_URL

COPY *.config.js ./
COPY package*.json ./
RUN npm install

COPY src src/
COPY public public/

RUN npm run build

#
# 2. Copy the files over and run it
#
FROM node:lts

WORKDIR /edge/account

COPY package*.json ./
RUN npm install --only=production

COPY server server/
COPY --from=build dist dist/

CMD ["npm", "start"]
