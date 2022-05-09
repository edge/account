const superagent = require('superagent')

// create a new session (i.e. log in)
export const createSession = async (host, accountNumber, secret) => {
  const url = `${host}/account/session`
  const response = await superagent.post(url)
  .send({ account: accountNumber, otp: secret })
  return response.body
}
