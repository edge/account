const superagent = require('superagent')


// create a new session (i.e. log in)
export const getSession = async (host, sessionId) => {
  const url = `${host}/sessions/${sessionId}`
  const response = await superagent.get(url)
  return response.body
}

// create a new session (i.e. log in)
export const createSession = async (host, accountNumber) => {
  const url = `${host}/sessions`
  const response = await superagent.post(url)
  .send({ account: accountNumber })
  return response.body
}
