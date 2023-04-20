// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import superagent from 'superagent'
import { toQueryString } from './helpers'

// delete notifications
export const deleteNotifications = async (host, sessionId, notifications) => {
  const url = `${host}/notifications`
  const response = await superagent.delete(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send(notifications)
  return response.body
}

// get notifications belonging to an account
export const getNotifications = async (host, sessionId, params) => {
  let url = `${host}/notifications`
  // add query params
  if (params !== undefined) url += `?${toQueryString(params)}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// mark notifications as read
export const markRead = async (host, sessionId, notifications) =>
  updateNotifications(host, sessionId, notifications.map(n => ({ _key: n._key, read: true })))

// mark notifications as unread
export const markUnread = async (host, sessionId, notifications) =>
  updateNotifications(host, sessionId, notifications.map(n => ({ _key: n._key, read: false })))

// update notifications (mark read/unread)
export const updateNotifications = async (host, sessionId, updates) => {
  const url = `${host}/notifications`
  const response = await superagent.put(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send(updates)
  return response.body
}
