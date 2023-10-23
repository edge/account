// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import superagent from 'superagent'
import { toQueryString } from './helpers'

// dummy data
const fileTree = [
  {
    directory: 'assets',
    children: [
      {
        directory: 'img',
        children: [
          { filename: '1.jpg', size: 213490 },
          { filename: '2.jpg', size: 63490 },
          { filename: '3.jpg', size: 253490 }
        ]
      },
      {
        directory: 'js',
        children: [
          { filename: 'index.js', size: 213490 },
          { filename: 'module1.js', size: 63490 },
          { filename: 'module2.js', size: 253490 }
        ]
      },
      {
        directory: 'css'
      },
      { filename: 'config.json', size: 12500 }
    ]
  },
  {
    directory: 'docs',
    children: [
      { filename: 'letter.pdf', size: 13050 }
    ]
  },
  { filename: 'README.md', size: 213490 }
]
const getDirectory = (path) => {
  if (!path) return fileTree
  else {
    const dirs = path.split('/')
    let currentDir = fileTree
    for (let i = 0; i < dirs.length; i++) {
      const dir = currentDir.find(d => d.directory === dirs[i])
      currentDir = dir.children || []
    }
    return currentDir
  }
}

// add a folder at a given path
export const createFolder = async (host, sessionId, integrationId, path, folderName) => {
  const fullPath = path.length ? `${path}/${folderName}` : folderName
  const url = `${host}/storage/${integrationId}/fs/${fullPath}`
  const response = await superagent.post(url).set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// delete a node (folder or file)
export const deleteNode = async (host, sessionId, integrationId, fullPath) => {
  const url = `${host}/storage/${integrationId}/fs/${fullPath}`
  const response = await superagent.delete(url).set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

/**
 * Get a node (and its children, if the node is a folder).
 *
 * Options may be an empty object. Usable properties include:
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
 */
export const getNode = async (host, sessionId, integrationId, fullPath, options) => {
  const url = `${host}/storage/${integrationId}/fs/${fullPath}`
  const req = superagent.get(url).set({ Authorization: `Bearer ${sessionId}` })
  if (options) req.query(options)
  const res = await req
  return res.body
}

// move node
export const moveNode = async (host, sessionId, integrationId, fullPath, path, nodeName) => {
  const url = `${host}/storage/${integrationId}/fs/${fullPath}`
  const data = { fullPath: path.length ? `${path}/${nodeName}` : nodeName }
  const res = await superagent.put(url).set({ 'Authorization': `Bearer ${sessionId}` }).send(data)
  return res.body
}

// upload a file
export const uploadFile = async (host, integrationId, apiKey, path, file) => {
  const url = `${host}/files${path ? '/' + path : ''}/${file.name}`
  const response = await superagent.post(url)
    .set({ 'Integration': `${integrationId}` })
    .set({ 'Authorization': `Bearer ${apiKey}` })
    .attach('file', file)
  // return response.body
  console.log(response.body)

  // dummy response - will remove once `getFiles()` works
  const fileData = { filename: file.name, size: file.size }
  getDirectory(path).push(fileData)
  return fileData
}
