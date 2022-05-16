// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import superagent from 'superagent'

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

// get server by id
export const getServer = async (host, sessionId, serverId) => {
  const url = `${host}/servers/${serverId}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// get all servers managed by the current account
export const getServers = async (host, sessionId) => {
  const url = `${host}/servers`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// create a new server
export const updateServer = async (host, sessionId, serverId, serverOptions) => {
  const url = `${host}/servers/${serverId}`
  const response = await superagent.put(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send(serverOptions)
  return response.body
}
