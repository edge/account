// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

const ACCOUNT_API_URL = process.env.VUE_APP_ACCOUNT_API_URL
const ACCOUNT_ENDPOINT = `${ACCOUNT_API_URL}/accounts`
const SERVER_ENDPOINT = `${ACCOUNT_API_URL}/servers`

/**
 * The data fetching method called by SWRV.
 *
 * @param {String} url - a relative URL for an fetching data from an API endpoint, e.g. `/servers`
 * @returns {Object}
 */
const fetcher = url => {
  return fetch(`${ACCOUNT_API_URL}${url}`)
    .then(response => response.json())
    .then(results => {
      return Promise.resolve(results)
    })
}

/**
 * Calls the "server" API endpoint to perform add an IP address to the specified VM.
 *
 * @param {Number} id - the ID of the VM (as `serverId` in API schema)
 */
const addIpAddress = async id => {
  const payload = {
    action: 'addIp',
    id
  }

  return fetchData(SERVER_ENDPOINT, { method: 'post' }, payload)
}

/**
 * Calls the "account" API endpoint to create a new user account.
 *
 * @returns {Object}
 */
const createAccount = async accountNumber => {
  const url = `${ACCOUNT_ENDPOINT}`

  return fetchData(url, { method: 'post' }, { accountNumber })
}

/**
 * Calls the "account" API endpoint to generate a new account number.
 *
 * @returns {Object}
 */
const generateAccountNumber = () => {
  const url = `${ACCOUNT_ENDPOINT}?action=new`

  return fetchData(url, { method: 'get' })
}

/**
 * Calls the "account" API endpoint to retrieve a user account.
 *
 * @returns {Object}
 */
const getAccount = async id => {
  const url = `${ACCOUNT_ENDPOINT}?id=${id}`

  return fetchData(url, { method: 'get' })
}

/**
 * Calls the "server" API endpoint to perform a VM backup operation.
 *
 * @param {Number} id - the ID of the VM (as `serverId` in API schema)
 * @param {Object} data - the parameters to apply to the VM backup
 * @example {
 *   name: "my-server-backup-20220219",
 *   comment: ""
 * }
 */
const createBackup = async (id, data) => {
  const payload = {
    action: 'backup',
    id,
    ...data
  }

  return fetchData(SERVER_ENDPOINT, { method: 'post' }, payload)
}

/**
 * Calls the "server" API endpoint to perform a VM create operation.
 *
 * @param {Object} data - the new parameters to apply to the VM
 * @example {
 *   cluster: 7,
 *   hostname: "my-server",
 *   domain: "my-server.edge.network",
 *   password: "2372hceuc7",
 *   preset: 9,
 *   os: 66
 * }
 */
const createHost = async (user, data) => {
  const payload = {
    action: 'create',
    user,
    ipPool: 8,
    ...data
  }

  return fetchData(SERVER_ENDPOINT, { method: 'post' }, payload)
}

/**
 * Calls the "server" API endpoint to delete a VM backup.
 *
 * @param {Number} backupId - the ID of the VM backup to delete
 */
const deleteBackup = async backup => {
  const payload = {
    action: 'deleteBackup',
    backupId: backup.id
  }

  return fetchData(SERVER_ENDPOINT, { method: 'post' }, payload)
}

/**
 * Calls the "server" API endpoint to perform a VM delete operation.
 *
 * @param {Object} data - contains the id of the VM to delete.
 * @example {
 *   id: 7
 * }
 */
const destroyHost = async id => {
  const payload = {
    action: 'destroy',
    id
  }

  return fetchData(SERVER_ENDPOINT, { method: 'post' }, payload)
}

// const getTask = async id => {
//   return fetchData(`${SERVER_ENDPOINT}?action=task&taskId=${id}`, { method: 'get' })
//     .then(response => {
//       return response
//     })
// }

/**
 * Calls the "server" API endpoint to perform remove an IP address from the specified VM.
 *
 * @param {Number} id - the ID of the IP address to remove
 */
const removeIpAddress = async id => {
  const payload = {
    action: 'removeIp',
    id
  }

  return fetchData(SERVER_ENDPOINT, { method: 'post' }, payload)
}

/**
 * Calls the "server" API endpoint to perform a VM resize operation.
 *
 * @param {Number} id - the ID of the VM (as `serverId` in API schema)
 * @param {Object} data - the new parameters to apply to the VM
 * @example {
 *    diskId: 0,
 *    cpuNumber: 2,
 *    memSize: 2000,
 *    hddSize: 15000,
 *  }
 */
const resizeHost = async (id, data) => {
  const payload = {
    action: 'resize',
    id,
    ...data
  }

  return fetchData(SERVER_ENDPOINT, { method: 'post' }, payload)
    .then(response => {
      return Promise.resolve(response)
    })
}

/**
 * Calls the "server" API endpoint to restore a VM from backup.
 *
 * @param {Number} id - the ID of the VM (as `serverId` in API schema)
 * @param {Number} backup - the VM backup object
 */
const restoreBackup = async (id, backup) => {
  const payload = {
    action: 'restoreBackup',
    id,
    backupId: backup.id
  }

  return fetchData(SERVER_ENDPOINT, { method: 'post' }, payload)
}

/**
 * Calls the "server" API endpoint to perform a VM power operation - i.e. start/stop.
 *
 * @param {Number} id - the ID of the VM (as `serverId` in API schema)
 * @param {String} action - the action to perform, e.g. "start" or "stop"
 */
const startStopHost = async (id, action) => {
  const payload = {
    action,
    id
  }

  return fetchData(SERVER_ENDPOINT, { method: 'post' }, payload)
}

const handleTwoFactor = async data => {
  const url = `${ACCOUNT_ENDPOINT}`

  return fetchData(url, { method: 'post' }, data)
}

const updateAccount = async data => {
  const url = `${ACCOUNT_ENDPOINT}`
  
  const payload = {
    action: 'update',
    ...data
  }
  
  return fetchData(url, { method: 'post' }, payload)
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

export {
  addIpAddress,
  createAccount,
  createBackup,
  createHost,
  deleteBackup,
  destroyHost,
  fetcher,
  generateAccountNumber,
  getAccount,
  handleTwoFactor,
  removeIpAddress,
  resizeHost,
  restoreBackup,
  startStopHost,
  updateAccount
}
