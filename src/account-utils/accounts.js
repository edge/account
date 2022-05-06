// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

const superagent = require('superagent')

export const createAccount = async (host) => {
  const url = `${host}/accounts`
  const response = await superagent.post(url)
  return response.body
}

export const enable2fa = async (host, accountId, sessionId) => {
  const url = `${host}/accounts/${accountId}/2fa`
  const response = await superagent.post(url)
  .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

export const enableRecovery = async (host, accountId, emailAddress, sessionId) => {
  const url = `${host}/accounts/${accountId}/recovery`
  const response = await superagent.post(url)
  .send({ address: emailAddress })
  .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

export const getAccount = async (host, accountId, sessionId) => {
  const url = `${host}/accounts/${accountId}`
  const response = await superagent.get(url)
  .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

export const verify2fa = async (host, accountId, sessionId) => {
  const url = `${host}/accounts/${accountId}/2fa`
  const response = await superagent.put(url)
  .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

export const verifyRecovery = async (host, accountId, secret, sessionId) => {
  const url = `${host}/accounts/${accountId}/recovery`
  const response = await superagent.put(url)
  .send({ secret: secret })
  .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}