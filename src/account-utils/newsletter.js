import superagent from 'superagent'

export const getSubscription = async (host, token) => {
  const url = `${host}/newsletter/subscriber`
  const response = await superagent.get(url).set('Authorization', `Bearer ${token}`)
  return response.body
}

export const subscribe = async (host, token, account) => {
  const url = `${host}/newsletter/subscriber`
  const response = await superagent.post(url)
    .set('Authorization', `Bearer ${token}`)
    .send({ account })
  return response.body
}

export const unsubscribe = async (host, token, account) => {
  const url = `${host}/newsletter/subscriber`
  const response = await superagent.delete(url)
    .set('Authorization', `Bearer ${token}`)
    .send({ account })
  return response.body
}
