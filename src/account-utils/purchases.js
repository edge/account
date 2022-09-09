// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import superagent from 'superagent'
import { toQueryString } from './helpers'

// cancel an XE purchase
export const cancelPurchase = async (host, sessionId, key) => {
  const url = `${host}/billing/purchases/${key}/cancel`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// create an XE purchase
export const createPurchase = async (host, sessionId, data) => {
  const url = `${host}/billing/purchases`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send(data)
  return response.body
}

// retrieve an XE purchase
export const getPurchase = async (host, sessionId, key) => {
  const url = `${host}/billing/purchases/${key}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// retrieve all XE purchases on an account
export const getPurchases = async (host, sessionId, params) => {
  let url = `${host}/billing/purchases`
  // add query params
  if (params !== undefined) url += `?${toQueryString(params)}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// refresh and retrieve an XE purchase
export const refreshPurchase = async (host, sessionId, key) => {
  const url = `${host}/billing/purchases/${key}/refresh`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}
