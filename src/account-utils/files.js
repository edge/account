// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import superagent from 'superagent'

/**
 * Create a folder.
 *
 * @param {string} host API base URL
 * @param {string} sessionId API token
 * @param {string} integrationId Integration ID
 * @param {string} fullPath Path to [folder] node
 * @return {object} New node data
 */
export const createFolder = async (host, sessionId, integrationId, fullPath) => {
  const url = `${host}/storage/${integrationId}/fs/${fullPath}`
  const res = await superagent.post(url).set({ 'Authorization': `Bearer ${sessionId}` })
  return res.body
}

/**
 * Delete a node.
 * This can be a folder or a file.
 * If it is a folder, all child nodes are deleted automatically by API.
 *
 * @param {string} host API base URL
 * @param {string} sessionId API token
 * @param {string} integrationId Integration ID
 * @param {string} fullPath Path to node
 * @return {object} Old node data
 */
export const deleteNode = async (host, sessionId, integrationId, fullPath) => {
  const url = `${host}/storage/${integrationId}/fs/${fullPath}`
  const res = await superagent.delete(url).set({ 'Authorization': `Bearer ${sessionId}` })
  return res.body
}

/**
 * Get a node.
 * If the node is a folder, then its child nodes can be navigated via the same API.
 *
 * Options may be an empty object. If it is given, usable properties include:
 *
 * ```js
 * const options = {
 *   // Sort folders to top (default 0/false)
 *   folderTop: 1,
 *   // Sort order, prefix with hyphen for descending sort. Can be fullPath, size, created, or lastModified
 *   sort: 'fullPath',
 *   // Limit number of results to retrieve
 *   limit: 10,
 *   // Page to retrieve (affected by limit)
 *   page: 1
 * }
 * ```
 *
 * @param {string} host API base URL
 * @param {string} sessionId API token
 * @param {string} integrationId Integration ID
 * @param {string} fullPath Path to node
 * @param {object} options Query parameters for navigating child nodes
 * @return {object} Node data
 */
export const getNode = async (host, sessionId, integrationId, fullPath, options) => {
  const url = `${host}/storage/${integrationId}/fs/${fullPath}`
  const req = superagent.get(url).set({ Authorization: `Bearer ${sessionId}` })
  if (options) req.query(options)
  const res = await req
  return res.body
}

/**
 * Move a node.
 * This can be a folder or a file.
 * If it is a folder, all child nodes are moved automatically by API.
 *
 * @param {string} host API base URL
 * @param {string} sessionId API token
 * @param {string} integrationId Integration ID
 * @param {string} fullPath Path to node
 * @param {string} newPath **New** path to node
 * @return {object} Node data
 */
export const moveNode = async (host, sessionId, integrationId, fullPath, newPath) => {
  const url = `${host}/storage/${integrationId}/fs/${fullPath}`
  const res = await superagent.put(url).set({ 'Authorization': `Bearer ${sessionId}` }).send({ fullPath: newPath })
  return res.body
}

/**
 * Upload a file.
 *
 * @param {string} host Gateway URL (**not** API base URL)
 * @param {string} integrationId Integration ID
 * @param {string} apiKey Integration API key
 * @param {string} fullPath Path to file
 * @param {object} file File data
 * @return {object} Gateway response with UUID
 */
export const uploadFile = async (host, integrationId, apiKey, fullPath, file) => {
  const url = `${host}/files/${integrationId}/${fullPath}`
  const res = await superagent.post(url).set({ 'Authorization': `Bearer ${apiKey}` }).attach('file', file)
  return res.body
}
