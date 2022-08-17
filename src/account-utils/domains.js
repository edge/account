// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import superagent from 'superagent'
import { toQueryString } from './helpers'

// create a new domain
export const createDomain = async (host, sessionId, domainKey) => {
  const url = `${host}/domains`
  const options = {
    domain: domainKey
  }
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send(options)
  return response.body
}

// delete domain
export const deleteDomain = async (host, sessionId, domainId) => {
  const url = `${host}/domains/${domainId}`
  const response = await superagent.delete(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// get domain by id
export const getDomain = async (host, sessionId, domainId) => {
  const url = `${host}/domains/${domainId}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// get all domains managed by the current account
export const getDomains = async (host, sessionId, params) => {
  let url = `${host}/domains`
  // add query params
  if (params !== undefined) url += `?${toQueryString(params)}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}
