import superagent from 'superagent'
import { toQueryString } from './helpers'

// get all notifications belonging to an account
export const getNotifications = async (host, sessionId, params) => {
  let url = `${host}/notifications`
  // add query params
  if (params !== undefined) url += `?${toQueryString(params)}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

export const markRead = async (host, sessionId, notifications) =>
  updateNotifications(host, sessionId, notifications.map(n => ({ _key: n._key, read: true })))

export const markUnread = async (host, sessionId, notifications) =>
  updateNotifications(host, sessionId, notifications.map(n => ({ _key: n._key, read: false })))

export const updateNotifications = async (host, sessionId, updates) => {
  const url = `${host}/notifications`
  const response = await superagent.put(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send(updates)
  return response.body
}
