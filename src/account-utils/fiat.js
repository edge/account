import superagent from 'superagent'

// create an XE purchase
export const createPurchase = async (host, sessionId, data) => {
  const url = `${host}/fiat/purchase`
  const response = await superagent.post(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
    .send(data)
  return response.body
}
