// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

const superagent = require('superagent')

export const createAccount = async (host) => {
  const url = `${host}/accounts`
  const response = await superagent.post(url)
  return response.body
}

export const enable2fa = async (host, sessionId, accountId) => {
  const url = `${host}/accounts/${accountId}/2fa`
  const response = await superagent.post(url)
  .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

export const enableRecovery = async (host, sessionId, accountId, emailAddress) => {
  const url = `${host}/accounts/${accountId}/recovery`
  const response = await superagent.post(url)
  .send({ address: emailAddress })
  .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

export const getAccount = async (host, sessionId, accountId) => {
  const url = `${host}/accounts/${accountId}`
  const response = await superagent.get(url)
  .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

export const verify2fa = async (host, sessionId, accountId, otp) => {
  const url = `${host}/accounts/${accountId}/2fa`
  const response = await superagent.put(url)
  .send({ otp })
  .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

export const verifyRecovery = async (host, sessionId, accountId, secret) => {
  const url = `${host}/accounts/${accountId}/recovery`
  const response = await superagent.put(url)
  .send({ secret: secret })
  .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}