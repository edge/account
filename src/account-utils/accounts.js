// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import superagent from 'superagent'

export const addTOTP = async (host, sessionId, options) => {
  const url = `${host}/account/totp`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send(options)
  return response.body
}

export const createAccount = async (host, referralCode) => {
  const url = `${host}/account`
  let response
  if (referralCode) response = await superagent.post(url)
    .send({ referralCode })
  else response = await superagent.post(url)
  return response.body
}

export const disableTOTP = async (host, sessionId, body) => {
  const url = `${host}/account/totp`
  const response = await superagent.delete(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send(body)
  return response.body
}

export const disableRecovery = async (host, sessionId) => {
  const url = `${host}/account/recovery`
  const response = await superagent.delete(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

export const enableRecovery = async (host, sessionId, address) => {
  const url = `${host}/account/recovery`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send({ address })
  return response.body
}

export const getAccount = async (host, sessionId) => {
  const url = `${host}/account`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

export const getReferrals = async (host, sessionId) => {
  const url = `${host}/account/referred`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

export const getWallet = async (host, sessionId) => {
  const url = `${host}/account/wallet`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

export const recoverAccount = async (host, address) => {
  const url = `${host}/account/recover`
  const response = await superagent.post(url)
    .send({ address })
  return response.body
}

export const verifyRecoverAccount = async (host, address, secret) => {
  const url = `${host}/account/recover`
  const response = await superagent.put(url)
    .send({ address, secret })
  return response.body
}

export const verifyRecovery = async (host, sessionId, secret) => {
  const url = `${host}/account/recovery`
  const response = await superagent.put(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send({ secret })
  return response.body
}
