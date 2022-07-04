// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import superagent from 'superagent'

// get a task by id
export const getTask = async (host, sessionId, taskId) => {
  const url = `${host}/tasks/${taskId}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// get all tasks associated with account, can be filtered by status, action and task id
export const getTasks = async (host, sessionId, params) => {
  const url = `${host}/tasks?${params}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}
