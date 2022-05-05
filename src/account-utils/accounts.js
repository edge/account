const superagent = require('superagent')

export const createAccount = async (host) => {
  const url = `${host}/accounts`
  const response = await superagent.post(url)
  return response.body
}

export const getAccount = async (host, accountId, sessionId) => {
  const url = `${host}/accounts/${accountId}`
  const response = await superagent.get(url)
  .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}