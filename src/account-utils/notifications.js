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
