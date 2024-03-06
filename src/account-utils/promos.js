import superagent from 'superagent'
import { toQueryString } from './helpers'

export async function getEntitlements(host, sessionId, params) {
  let url = `${host}/entitlements`
  if (params !== undefined) url += `?${toQueryString(params)}`
  const response = await superagent.get(url).set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

export async function redeem(host, sessionId, account, code) {
  const url = `${host}/redeem`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send({ account, code })
  return response.body
}
