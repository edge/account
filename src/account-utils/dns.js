// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import superagent from 'superagent'
import { toQueryString } from './helpers'

// create a new domain
export const addZone = async (host, sessionId, account, zone) => {
  const url = `${host}/dns`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send({ account, zone })
  return response.body
}

// create a new record
export const createRecord = async (host, sessionId, zoneKey, recordOptions) => {
  const url = `${host}/dns/${zoneKey}/records`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send(recordOptions)
  return response.body
}

// delete record
export const deleteRecord = async (host, sessionId, zoneKey, recordKey) => {
  const url = `${host}/dns/${zoneKey}/records/${recordKey}`
  const response = await superagent.delete(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// delete domain
export const deleteZone = async (host, sessionId, zoneKey) => {
  const url = `${host}/dns/${zoneKey}`
  const response = await superagent.delete(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// create a new record
export const editRecord = async (host, sessionId, zoneKey, recordKey, recordOptions) => {
  const url = `${host}/dns/${zoneKey}/records/${recordKey}`
  const response = await superagent.put(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send(recordOptions)
  return response.body
}

// get record by key
export const getRecord = async (host, sessionId, zoneKey, recordKey) => {
  const url = `${host}/dns/${zoneKey}/records/${recordKey}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// get all records belonging to a zone
export const getRecords = async (host, sessionId, zoneKey, params) => {
  let url = `${host}/dns/${zoneKey}/records`
  // add query params
  if (params !== undefined) url += `?${toQueryString(params)}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// get domain by key
export const getZone = async (host, sessionId, zoneKey) => {
  const url = `${host}/dns/${zoneKey}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// get all domains managed by the current account
export const getZones = async (host, sessionId, params) => {
  let url = `${host}/dns`
  // add query params
  if (params !== undefined) url += `?${toQueryString(params)}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}
