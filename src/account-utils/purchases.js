import superagent from 'superagent'

// create an XE purchase
export const createPurchase = async (host, sessionId, data) => {
  const url = `${host}/purchases`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send(data)
  return response.body
}

// retrieve an XE purchase
export const getPurchase = async (host, sessionId, key) => {
  const url = `${host}/purchases/${key}`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}

// refresh and retrieve an XE purchase
export const refreshPurchase = async (host, sessionId, key) => {
  const url = `${host}/purchases/${key}/refresh`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}
