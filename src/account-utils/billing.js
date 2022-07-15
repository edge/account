// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import superagent from 'superagent'
import { toQueryString } from './helpers'

export const addPaymentMethod = async (host, sessionId, data) => {
  const url = `${host}/billing/paymentMethods`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send(data)
  return response.body
}

export const getBalance = async (host, sessionId) => {
  const url = `${host}/billing/balance`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

export const getInvoices = async (host, sessionId, params) => {
  let url = `${host}/billing/invoices`
  // add query params
  if (params !== undefined) url += `?${toQueryString(params)}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

export const unholdInvoice = async (host, sessionId, invoiceId) => {
  const url = `${host}/billing/invoices/${invoiceId}/unhold`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}
