// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import superagent from 'superagent'
import { toQueryString } from './helpers'

// create a new integration
export const addIntegration = async (host, sessionId, integration) => {
  const url = `${host}/integrations`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send(integration)
  return response.body
}

// delete integration
export const deleteIntegration = async (host, sessionId, integrationKey) => {
  const url = `${host}/integrations/${integrationKey}`
  const response = await superagent.delete(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// flush cache for specific path
export const flushCache = async (host, sessionId, integrationKey, path) => {
  const url = `${host}/integrations/${integrationKey}/cdn/cache`
  const response = await superagent.delete(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send({ path })
  return response.body
}

// get integration by key
export const getIntegration = async (host, sessionId, integrationKey) => {
  const url = `${host}/integrations/${integrationKey}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// get integration by key
export const getIntegrationMetrics = async (host, sessionId, integrationKey, options) => {
  const { range, count } = options
  const url = `${host}/integrations/${integrationKey}/usage?range=${range}&count=${count}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// get all integration managed by the current account
export const getIntegrations = async (host, sessionId, params) => {
  let url = `${host}/integrations`
  // add query params
  if (params !== undefined) url += `?${toQueryString(params)}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// create a new integration
export const updateIntegration = async (host, sessionId, integrationKey, integration) => {
  const url = `${host}/integrations/${integrationKey}`
  const response = await superagent.put(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send(integration)
  return response.body
}
