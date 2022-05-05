//NEW ACCOUNT UTILS

const superagent = require('superagent')

const ACCOUNT_API_URL = process.env.VUE_APP_ACCOUNT_API_URL
const ACCOUNTS_ENDPOINT = `${ACCOUNT_API_URL}/accounts`
const SESSIONS_ENDPOINT = `${ACCOUNT_API_URL}/sessions`
const SERVER_ENDPOINT = `${ACCOUNT_API_URL}/servers`

// create a new account
export const createAccount = async () => {
  const response = await superagent.post(ACCOUNTS_ENDPOINT)

  return response.body
}

// create a new session (i.e. log in)
export const createSession = async (accountId) => {
  const response = await superagent.post(SESSIONS_ENDPOINT)
  .send({ account: accountId })

  return response.body
}

// get account details
export const getAccount = async (accountId, sessionId) => {
  const url = `${ACCOUNTS_ENDPOINT}/${accountId}`

  const response = await superagent.get(url)
  .set({ 'Authorization': `Bearer ${sessionId}` })

  return response.body
}