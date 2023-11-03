// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import superagent from 'superagent'

// parse domain with psl to determine apex status
export const pslParse = async (host, sessionId, domain) => {
  const url = `${host}/psl/parse/${domain}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send()
  return response.body
}

// Transform any simple object into a query string for use in URLs.
export const toQueryString = data => Object.keys(data)
  .map(key => {
    const v = data[key]
    if (v instanceof Array) return v.map(str => `${key}=${urlsafe(str)}`).join('&')
    return `${key}=${urlsafe(v)}`
  })
  .join('&')

// Sanitize a value for use in URLs.
export const urlsafe = v => {
  if (typeof v === 'string') return v.replace(/ /g, '%20')
  return `${v}`
}
