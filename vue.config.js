// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = {
  assetsDir: 'assets/',
  chainWebpack: config => {
    config
      .plugin('polyfills')
      .use(NodePolyfillPlugin)
  }
}
