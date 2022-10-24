// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import superagent from 'superagent'

// get a product
export const get = async (host, sessionId, key) => {
  const url = `${host}/products/${key}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// subscribe to a product
export const subscribe = async (host, sessionId, key) => {
  const url = `${host}/products/${key}/subscription`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// get subscriptions
export const subscriptions = async (host, sessionId) => {
  const url = `${host}/subscriptions`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// subscribe to a product
export const unsubscribe = async (host, sessionId, key) => {
  const url = `${host}/products/${key}/subscription`
  const response = await superagent.delete(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}
