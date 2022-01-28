// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

// const ApiWrapper = require('@dadi/api-wrapper-core')
// const qs = require('querystring')

const ACCOUNT_API_URL = process.env.VUE_APP_ACCOUNT_API_URL

const fetcher = function(url) {
  return fetch(`${ACCOUNT_API_URL}${url}`)
    .then(response => response.json())
    .then(results => {
      return Promise.resolve(results)
    })
}

// const API_SETTINGS = {
//   uri: process.env.API_HOST,
//   port: process.env.API_PORT,
//   credentials: {
//     clientId: process.env.API_CLIENT,
//     secret: process.env.API_SECRET
//   }
// }

// const API_SETTINGS.property = 'accounts'



// const url = require('./url')()
// const ApiWrapper = require('@dadi/api-wrapper-core')
// const TokenStore = require('./tokenStore')

// const DOCUMENT_LIMIT = 1

// class API {
//   constructor (req, res) {
//     this.tokenStore = TokenStore(req, res)

// const API_SETTINGS = {
//   uri: process.env.VUE_APP_API_HOST,
//   port: process.env.VUE_APP_API_PORT,
//   property: process.env.VUE_APP_API_DATABASE,
//   version: '1.0',
//   credentials: {
//     clientId: process.env.VUE_APP_API_CLIENT_ID,
//     secret: process.env.VUE_APP_API_CLIENT_SECRET
//   }
// }

    // this.api = new ApiWrapper(this.settings)
  // }

  // create (...args) {
  //   return this.save(...args)
  // }

  // delete (collection, query) {
  //   return this.api
  //     .in(collection)
  //     .where(query)
  //     .delete()
  // }

  // find (collection, query, options = {}) {
  //   let apiQuery = this.api
  //     .in(collection)
  //     .where(query)

  //   if (options.fields) {
  //     apiQuery = apiQuery.useFields(options.fields)
  //   }

  //   if (options.limit) {
  //     apiQuery = apiQuery.limitTo(options.limit)
  //   }

  //   return apiQuery
  //     .find({ extractResults: true })
  // }

  // findPostBySlug (slug) {
  //   return this.api
  //     .fromEndpoint('posts')
  //     .whereFieldIsEqualTo('slug', slug)
  //     .find()
  // }

  // getCount (sequence) {
  //   return this.api
  //     .fromEndpoint('posts')
  //     .whereFieldIsGreaterThan('sequence', sequence)
  //     .limitTo(1)
  //     .find()
  // }

  // getPosts (query, page, limit, sort) {
  //   const sortKey = Object.keys(sort)[0]

  //   return this.api
  //     .fromEndpoint('posts')
  //     .where(query)
  //     .goToPage(page)
  //     .sortBy(sortKey, sort[sortKey] === 1 ? 'asc' : 'desc')
  //     .limitTo(limit > DOCUMENT_LIMIT ? limit : DOCUMENT_LIMIT)
  //     .find()
  // }

  // getInteractions (query) {
  //   return this.api
  //     .fromEndpoint('interaction')
  //     .where(query)
  //     .find()
  // }

  // findById (collection, id) {
  //   return this.api
  //     .in(collection)
  //     .whereFieldIsEqualTo('_id', id)
  //     .find({ extractResults: true })
  // }

  // save (collection, data) {
  //   return this.api
  //     .in(collection).create(data)
  // }

  // update (collection, query, data) {
  //   return this.api
  //     .in(collection)
  //     .where(query)
  //     .update(data)
  // }

  // recordInteraction (data) {
  //   return this.api
  //     .fromEndpoint('interaction').create(data)
  // }

  // subscribe (data) {
  //   return this.api
  //     .fromEndpoint('subscribe').create(data)
  // }

  // updateById (collection, id, data) {
  //   return this.api
  //     .in(collection)
  //     .whereFieldIsEqualTo('_id', id)
  //     .update(data)
  //     .then(replies => {
  //       return replies
  //     })
  //     .catch(err => {
  //       console.log(err)
  //     })
  // }

  // const fetchToken = () => {
  //   const uri = `${process.env.API_HOST}/token`

  //   console.log('Fetching API access token...')

  //   try {
  //     return fetch(uri, {
  //       body: JSON.stringify(apisettings.credentials),
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       method: 'post',
  //       responseType: 'json'
  //     })
  //       .then(response => {
  //         return Promise.resolve(response.json())
  //       })
  //   } catch (error) {
  //     console.log('error :>> ', error)
  //   }
  // }

  // const requestToken = () => {
  //   console.log('Requesting API access token...')

  //   return fetchToken()
  //     .then(response => {
  //       console.log('response', response)
  //       console.log('Storing token...')

  //       // return this
  //       //   .tokenStore
  //       //   .storeToken(response)
  //       //   .then(tokenData => {
  //       //     console.log('Returning token...')
  //       //     return Promise.resolve(tokenData.at)
  //       //   })
  //     }).catch(errorData => {
  //       console.log('errorData :>> ', errorData)
  //       return Promise.reject(errorData)
  //     // return Promise.reject(this.createErrorObject(errorData))
  //     })
  // }

  // const executeRequest = requestObject => {
  //   // return this.getToken()
  //   //   .then(async bearerToken => {
  //       return fetch(requestObject.uri.href, {
  //         body: JSON.stringify(requestObject.body),
  //         headers: Object.assign({}, requestObject.headers, {
  //   //         Authorization: `Bearer ${bearerToken}`,
  //           'Content-Type': 'application/json'
  //         }),
  //         method: requestObject.method
  //       }).then(response => {
  //         return response.json()
  //       }).catch(err => {
  //         console.log('error :>> ', err)
  //       })
  //   //   }).catch(err => {
  //   //     console.log('error :>> ', err)
  //   //   })
  // }

//   getToken (refresh) {
//     // if (!this.walletModule) {
//     //   return this.requestToken()
//     // }

//     // if (refresh) {
//     //   return this.requestToken()
//     // }

//     const currentDate = Math.floor(Date.now() / 1000)

//     return this.tokenStore
//       .getToken()
//       .then(tokenData => {
//         if (!tokenData) {
//           return this.requestToken()
//         }

//         // console.log('Found existing API access token')

//         // Use existing token if it hasn't expired, else request new one.
//         if (tokenData.ed > currentDate) {
//           console.log('Using existing API access token')

//           return Promise.resolve(tokenData.at)
//         } else {
//           // console.log('Existing API access token expired')

//           return this.requestToken()
//         }
//       })
//       .catch(err => {
//         if (err) {
//           console.log('err :>> ', err)
//         }

//         return this.requestToken()
//       })
//   }
// // }

// module.exports = ({ req, res }) => {
//   return new API(req, res)
// }

// const getApi = () => {
//   console.log('apisettings', API_SETTINGS)
//   return new ApiWrapper(API_SETTINGS)
// }

const createAccount = async () => {
  const url = `${ACCOUNT_API_URL}/1.0/accounts`

  return fetchData(url, { method: 'post' })
    .then(response => {
      console.log('response', response)
    })
}

const resizeHost = async (id, data) => {
  const url = `${ACCOUNT_API_URL}/servers`

  const payload = {
    action: 'resize',
    id,
    ...data
  }

  return fetchData(url, { method: 'post' }, payload)
    .then(response => {
      console.log('response', response)
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
  fetcher,
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
