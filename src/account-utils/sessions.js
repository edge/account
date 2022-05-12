// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import superagent from 'superagent'

// create a new session (i.e. log in)
export const createSession = async (host, accountNumber, secret) => {
  const url = `${host}/account/session`
  const response = await superagent.post(url)
    .send({ account: accountNumber, otp: secret })
  return response.body
}

// get a session (i.e. to check if authorized)
export const getSession = async (host, sessionId) => {
  const url = `${host}/account/session`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}
