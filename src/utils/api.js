// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

const ACCOUNT_API_URL = process.env.VUE_APP_ACCOUNT_API_URL

const fetcher = function(url) {
  return fetch(`${ACCOUNT_API_URL}${url}`)
    .then(response => response.json())
    .then(results => {
      return Promise.resolve(results)
    })
}

const createAccount = async () => {
  const url = `${ACCOUNT_API_URL}/1.0/accounts`

  return fetchData(url, { method: 'post' })
    .then(response => {
      console.log('response', response)
    })
}

const createBackup = async (id, data) => {
  const url = `${ACCOUNT_API_URL}/servers`

  const payload = {
    action: 'backup',
    id,
    ...data
  }

  return fetchData(url, { method: 'post' }, payload)
    .then(response => {
      console.log('response', response)
    })
}

const getTask = async id => {
  const url = `${ACCOUNT_API_URL}/servers?action=task&taskId=${id}`

  return fetchData(url, { method: 'get' })
    .then(response => {
      return response
    })
}

const resizeHost = async (id, data) => {
  const url = `${ACCOUNT_API_URL}/servers`

  const payload = {
    action: 'resize',
    id,
    ...data
  }

  console.log('payload', payload)

  return fetchData(url, { method: 'post' }, payload)
    .then(response => {
      console.log('response', response)
      return Promise.resolve(response)
    })
}

const fetchData = (url, options = {}, payload) => {
  const fetchOptions = {
    method: options.method || 'get',
    headers: {
      'content-type': 'application/json'
    }
  }

  if (payload) {
    fetchOptions.body = JSON.stringify(payload, true, 2)
  }

  return fetch(url, fetchOptions)
    .then(res => {
      // a non-200 response code
      if (!res.ok) {
        // create error instance with HTTP status text
        const error = new Error(res.statusText)
        error.json = res.json()
        throw error
      }

      return res.json()
    })
    .catch(() => {
      return {
        results: [],
        metadata: {}
      }
    })
}

// const deleteBy = (collection, field, value) => {
//   return getApi()
//     .inProperty(API_SETTINGS.property)
//     .in(collection)
//     .whereFieldIsEqualTo(field, value)
//     .delete()
// }

// const deleteWhere = (collection, query) => {
//   return getApi()
//     .inProperty(API_SETTINGS.property)
//     .in(collection)
//     .where(query)
//     .delete()
// }

// const find = (collection, query) => {
//   return getApi()
//     .inProperty(API_SETTINGS.property)
//     .in(collection)
//     .where(query)
//     .limitTo(500)
//     .find({ extractResults: true })
// }

// const findById = (collection, id) => {
//   return getApi()
//     .inProperty(API_SETTINGS.property)
//     .in(collection)
//     .whereFieldIsEqualTo('_id', id)
//     .find({ extractResults: true })
// }

// const findWithMeta = (collection, query) => {
//   return getApi()
//     .inProperty(API_SETTINGS.property)
//     .in(collection)
//     .where(query)
//     .find({ extractResults: false })
// }

// const save = (collection, data) => {
//   return getApi()
//     .inProperty(API_SETTINGS.property)
//     .in(collection)
//     .create(data)
// }

// const update = (collection, query, data) => {
//   return getApi()
//     .inProperty(API_SETTINGS.property)
//     .in(collection)
//     .where(query)
//     .update(data)
// }

// const updateById = (collection, id, data) => {
//   return getApi()
//     .inProperty(API_SETTINGS.property)
//     .in(collection)
//     .whereFieldIsEqualTo('_id', id.toString())
//     .update(data)
// }

export {
  createAccount,
  createBackup,
  fetcher,
  getTask,
  resizeHost
  // deleteBy,
  // deleteWhere,
  // executeRequest,
  // find,
  // findById,
  // findWithMeta,
  // save,
  // update,
  // updateById
}
