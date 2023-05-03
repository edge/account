// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import superagent from 'superagent'
import { toQueryString } from './helpers'

// add IP address to server
export const addIPAddress = async (host, sessionId, serverId) => {
  const url = `${host}/servers/${serverId}/ip`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// create a backup
export const createBackup = async (host, sessionId, serverId, comment) => {
  const url = `${host}/servers/${serverId}/backups`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send({ comment })
  return response.body
}

// create a new server
export const createServer = async (host, sessionId, accountId, serverOptions) => {
  const url = `${host}/servers`
  const options = {
    ...serverOptions,
    account: accountId
  }
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send(options)
  return response.body
}

// delete specific IP address from server
export const deleteBackup = async (host, sessionId, serverId, backupID) => {
  const url = `${host}/servers/${serverId}/backups/${backupID}`
  const response = await superagent.delete(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// delete specific IP address from server
export const deleteIPAddress = async (host, sessionId, serverId, ip) => {
  const url = `${host}/servers/${serverId}/ip`
  const response = await superagent.delete(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send({ ip })
  return response.body
}

// delete server
export const deleteServer = async (host, sessionId, serverId) => {
  const url = `${host}/servers/${serverId}`
  const response = await superagent.delete(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// get backups for server by id
export const getBackups = async (host, sessionId, serverId, params) => {
  let url = `${host}/servers/${serverId}/backups`
  // add query params
  if (params !== undefined) url += `?${toQueryString(params)}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// get total backups usage for server by id
export const getBackupsUsage = async (host, sessionId, serverId) => {
  const url = `${host}/servers/${serverId}/backups/usage`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

export const getHostname = async (host, sessionId) => {
  const url = `${host}/servers/hostname`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

export const getMetrics = async (host, sessionId, serverId) => {
  const url = `${host}/servers/${serverId}/metrics`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// get server by id
export const getServer = async (host, sessionId, serverId) => {
  const url = `${host}/servers/${serverId}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// get all servers managed by the current account
export const getServers = async (host, sessionId, params) => {
  let url = `${host}/servers`
  // add query params
  if (params !== undefined) url += `?${toQueryString(params)}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// get server tasks by server id
export const getTasks = async (host, sessionId, serverId, params) => {
  let url = `${host}/servers/${serverId}/tasks`
  // add query params
  if (params !== undefined) url += `?${toQueryString(params)}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// get a server's VNC credentials, including a session id and VNC password
export const getVncSession = async (host, sessionId, serverId) => {
  const url = `${host}/servers/${serverId}/vnc/credentials`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// resize server
export const resizeServer = async (host, sessionId, serverId, newServerSpec) => {
  const url = `${host}/servers/${serverId}/resize`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send({ spec: newServerSpec })
  return response.body
}

// resize server
export const restoreBackup = async (host, sessionId, serverId, backupId) => {
  const url = `${host}/servers/${serverId}/backups/${backupId}/restore`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// start a server
export const startServer = async (host, sessionId, serverId) => {
  const url = `${host}/servers/${serverId}/start`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// stop a server
export const stopServer = async (host, sessionId, serverId) => {
  const url = `${host}/servers/${serverId}/stop`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// update server - currently used only to update server name
export const updateServer = async (host, sessionId, serverId, data) => {
  const url = `${host}/servers/${serverId}`
  const response = await superagent.put(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send(data)
  return response.body
}
