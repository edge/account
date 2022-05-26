// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import superagent from 'superagent'

export const createAccount = async (host) => {
  const url = `${host}/account`
  const response = await superagent.post(url)
  return response.body
}

export const enable2FA = async (host, sessionId) => {
  const url = `${host}/account/2fa`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

export const enableRecovery = async (host, sessionId, emailAddress) => {
  const url = `${host}/account/recovery`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send({ address: emailAddress })
  return response.body
}

export const disable2FA = async (host, sessionId) => {
  const url = `${host}/account/2fa`
  const response = await superagent.delete(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

export const disableRecovery = async (host, sessionId) => {
  const url = `${host}/account/recovery`
  const response = await superagent.delete(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

export const getAccount = async (host, sessionId) => {
  const url = `${host}/account`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

export const verify2FA = async (host, sessionId, otp) => {
  const url = `${host}/account/2fa`
  const response = await superagent.put(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send({ otp })
  return response.body
}

export const verifyRecovery = async (host, sessionId, secret) => {
  const url = `${host}/account/recovery`
  const response = await superagent.put(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send({ secret: secret })
  return response.body
}
