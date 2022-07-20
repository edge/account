import superagent from 'superagent'

// cancel an XE purchase
export const cancelPyurchase = async (host, sessionId, key) => {
  const url = `${host}/billing/purchases/${key}/cancel`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// create an XE purchase
export const createPurchase = async (host, sessionId, data) => {
  const url = `${host}/billing/purchases`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send(data)
  return response.body
}

// retrieve an XE purchase
export const getPurchase = async (host, sessionId, key) => {
  const url = `${host}/billing/purchases/${key}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// retrieve all XE purchases on an account
export const getPurchases = async (host, sessionId) => {
  const url = `${host}/billing/purchases`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// refresh and retrieve an XE purchase
export const refreshPurchase = async (host, sessionId, key) => {
  const url = `${host}/billing/purchases/${key}/refresh`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}
