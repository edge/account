// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import superagent from 'superagent'
import { toQueryString } from './helpers'

// dummy data
import _ from 'lodash'
const integrations = [
  {
    _key: 'f47ee395-146e-4821-adb3-caa9b2e270b5',
    apiKey: 'f47ee395-146e-4821-adb3-caa9b2e270b5',
    name: 'My Test Storage',
    configMode: 'advanced',
    data: {
      config: {
        one: 'test one',
        three: {
          nestedOne: true,
          nestedTwo: 'test nested two'
        }
      }
    },
    active: true,
    created:1692986494307,
    updated:1693844207047
  },
  {
    _key: 'caa9b2e270b5-146e-4821-adb3-f47ee395',
    apiKey: 'caa9b2e270b5-146e-4821-adb3-f47ee395',
    name: 'My Second Test Storage',
    configMode: 'advanced',
    data: {
      config: {
        one: 'test one',
        three: {
          nestedOne: true,
          nestedTwo: 'test nested two'
        }
      }
    },
    active: true,
    created:1692986494307,
    updated:1693844207047
  }
]
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

// add a file at a given path
export const createDirectory = async (host, sessionId, integrationId, path, directoryName) => {
  // dummy response
  await new Promise(resolve => setTimeout(resolve, 200))
  const dirData = { directory: directoryName, children: [] }
  getDirectory(path).push(dirData)
  return dirData
  const url = `${host}/storage/${integrationId}`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send(data)
  return response.body
}

// create a new storage integration
export const createIntegration = async (host, sessionId, data) => {
  // dummy response
  await new Promise(resolve => setTimeout(resolve, 600))
  const integration = {
    _key: '1af15b84-fe74-4416-83d8-df1b81a73ae1',
    apiKey: '1af15b84-fe74-4416-83d8-df1b81a73ae1',
    ...data,
    created: Date.now(),
    updated: Date.now(),
    active: true
  }
  integrations.push(integration)
  return { integration }
  const url = `${host}/storage`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send(data)
  return response.body
}

// delete a directory and associated files
export const deleteDirectory = async (host, sessionId, integrationId, path, directory) => {
  // dummy response
  await new Promise(resolve => setTimeout(resolve, 400))
  const dir = getDirectory(path)
  const index = dir.findIndex(i => i.directory === directory)
  dir.splice(index, 1)
  return directory
  const url = `${host}/storage/${integrationId}/${path}`
  const response = await superagent.delete(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// delete a file
export const deleteFile = async (host, apiKey, path, filename) => {
  // dummy response
  await new Promise(resolve => setTimeout(resolve, 400))
  const dir = getDirectory(path)
  const index = dir.findIndex(i => i.filename === filename)
  dir.splice(index, 1)
  return filename
  const url = 'tbd'
  return 'tbd'
}

// delete storage integration
export const deleteIntegration = async (host, sessionId, integrationId) => {
  // dummy response
  await new Promise(resolve => setTimeout(resolve, 1200))
  const index = integrations.findIndex(i => i._key === integrationId)
  const integration = integrations[index]
  integrations.splice(index, 1)
  return { integration }
  const url = `${host}/storage/${integrationId}`
  const response = await superagent.delete(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// get storage integration by id
export const getIntegration = async (host, sessionId, integrationId) => {
  // dummy response
  await new Promise(resolve => setTimeout(resolve, 200))
  return { integration: integrations.find(i => i._key === integrationId) }
  const url = `${host}/storage/${integrationId}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// get files in give directory
export const getFiles = async (host, sessionId, integrationId, path) => {
  // dummy response
  await new Promise(resolve => setTimeout(resolve, 200))
  return { files: getDirectory(path), path }
  const url = `${host}/storage/${integrationId}/${path}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// get all storage integrations for session account
export const getIntegrations = async (host, sessionId, params) => {
  // dummy response
  await new Promise(resolve => setTimeout(resolve, 200))
  return {
    results: integrations,
    metadata: {
      count: 2,
      totalCount: 2
    }
  }
  let url = `${host}/storage`
  // add query params
  if (params !== undefined) url += `?${toQueryString(params)}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// regenerate integration api key
export const regenerateApiKey = async (host, sessionId, integrationId) => {
  // dummy response
  await new Promise(resolve => setTimeout(resolve, 600))
  const index = integrations.findIndex(i => i._key === integrationId)
  integrations[index].apiKey = 'fe74-1af15b84-83d8-4416-df1b81a73ae1'
  return { integration: integrations[index] }
  const url = `${host}/storage/${integrationId}/regenerate`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// rename directory
export const renameDirectory = async (host, sessionId, integrationId, path, directory, newDirectoryName) => {
  // dummy response
  await new Promise(resolve => setTimeout(resolve, 400))
  const dir = getDirectory(path)
  const index = dir.findIndex(i => i.directory === directory)
  dir[index].directory = newDirectoryName
  return dir[index]
  const url = 'tbd'
  return 'tbd'
}

// rename file
export const renameFile = async (host, apiKey, path, filename, newFilename) => {
  // dummy response
  await new Promise(resolve => setTimeout(resolve, 400))
  const dir = getDirectory(path)
  const index = dir.findIndex(i => i.filename === filename)
  dir[index].filename = newFilename
  return dir[index]
  const url = 'tbd'
  return 'tbd'
}

// update storage integration
export const updateIntegration = async (host, sessionId, integrationId, data) => {
  // dummy response
  const index = integrations.findIndex(i => i._key === integrationId)
  const integration = _.merge(integrations[index], data)
  integrations[index] = integration
  return { integration }
  const url = `${host}/storage/${integrationId}`
  const response = await superagent.put(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send(data)
  return response.body
}

// upload a file
export const uploadFile = async (host, apiKey, path, file) => {
  // dummy response
  const delay = Math.floor(Math.random() * 1000) + 500
  await new Promise(resolve => setTimeout(resolve, delay))
  const fileData = { filename: file.name, size: file.size }
  getDirectory(path).push(fileData)
  return fileData
  const url = 'tbd'
  return 'tbd'
}
