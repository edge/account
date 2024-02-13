// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import superagent from 'superagent'
import { toQueryString } from './helpers'

// dismiss (mark as read) array of announcements by id
export const dismissAnnouncements = async (host, sessionId, account, announcements) => {
  const url = `${host}/announcements/read`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send({ account, announcements })
  return response.body
}

// get announcement by id
export const getAnnouncement = async (host, sessionId, announcementId) => {
  const url = `${host}/announcements/${announcementId}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// get all announcements belong to account
export const getAnnouncements = async (host, sessionId, params) => {
  let url = `${host}/announcements`
  // add query params
  if (params !== undefined) url += `?${toQueryString(params)}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// undismiss (mark as unread) array of announcemets by id
export const undismissAnnouncements = async (host, sessionId, account, announcements) => {
  const url = `${host}/announcements/read`
  const response = await superagent.delete(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send({ account, announcements })
  return response.body
}
