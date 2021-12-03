# Copyright (C) 2021 Edge Network Technologies Limited
# Use of this source code is governed by a GNU GPL-style license
# that can be found in the LICENSE.md file. All rights reserved.

FROM node:lts

WORKDIR /www

COPY package*.json ./
RUN npm install --only=production

# TODO: add files

CMD ["npm", "start"]