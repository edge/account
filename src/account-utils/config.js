// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import superagent from 'superagent'

// retrieve config
export const getConfig = async (host) => {
  const url = `${host}/config`
  const response = await superagent.get(url)
  return response.body
}
