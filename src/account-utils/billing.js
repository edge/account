// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import superagent from 'superagent'

export const getInvoices = async (host, sessionId) => {
  const url = `${host}/billing/invoices`
  const response = await superagent.get(url)
    .set({ 'Authorization': `Bearer ${sessionId}` })
  return response.body
}
