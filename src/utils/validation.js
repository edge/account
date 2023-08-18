// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { validatePath } from '@edge/cache-config'
import { email as _email, required as _required, helpers, or } from '@vuelidate/validators'

/**
 * Required value validator with a more attractive error message than default.
 */
export const required = helpers.withMessage('A value is required.', _required)

/**
 * Account number validator.
 */
const accountNumberRegexp = /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/
export const accountNumberInput = helpers.withMessage('Your account number is 16 digits', v => accountNumberRegexp.test(v))

/**
 * Sign in input validator (can sign in with email or account number)
 */
export const signInInput = helpers.withMessage('Please enter a valid account number or email', or(v => accountNumberRegexp.test(v), _email))

/**
 * 8-digit alphanumeric backup code validator.
 */
const backupCodeRegexp = /^[A-Za-z0-9]{8}$/
export const backupCode = helpers.withMessage('The backup code is an 8-digit alphanumeric code', v => backupCodeRegexp.test(v))

/**
 * Email validator.
 */
export const email = helpers.withMessage('Please enter a valid email', _email)

/**
 * 6-digit confirmation code validator.
 */
const confCodeRegexp = /^\d{1}\s?\d{1}\s?\d{1}\s?\d{1}\s?\d{1}\s?\d{1}$/
export const confirmationCode = helpers.withMessage('The confirmation code is 6 digits', v => confCodeRegexp.test(v))

/**
 * Server name validators.
 * - valid characters (alphanumeric, periods, underscores and hyphens)
 * - alphanumeric first character
 * - length
 */
const serverNameCharsRegexp = /^[a-zA-Z0-9-_.]*$/
export const serverNameChars = helpers.withMessage(
  'Must contain only alphanumeric characters, periods, underscores, and hyphens',
  // don't display error if no value entered
  v => {
    if(v) return serverNameCharsRegexp.test(v)
    else return true
  }
)

const serverNameFirstCharRegexp = /^[a-zA-Z0-9]{1}/
export const serverNameFirstChar = helpers.withMessage(
  'The first character must be alphanumeric',
  // don't display error if no value entered
  v => {
    if(v) return serverNameFirstCharRegexp.test(v)
    else return true
  }
)

const serverNameLengthRegexp = /^.{1,64}$/
export const serverNameLength = helpers.withMessage(
  'Must be between 1 and 64 characters',
  v => serverNameLengthRegexp.test(v)
)

/**
 * Server password validator.
 */
const serverPasswordRegexp = /^.{6,35}$/
export const serverPassword = helpers.withMessage(
  'Password must be between 6 and 35 characters',
  v => serverPasswordRegexp.test(v)
)

/**
 * Server domain validator.
 */
const domainRegexp = /((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}/i
export const domain = helpers.withMessage(
  'Must be a valid domain name',
  v => domainRegexp.test(v)
)

/**
 * Server backup comment validator.
*/
const serverCommentLengthRegexp = /^.{1,128}$/
export const serverCommentLength = helpers.withMessage(
  'Must be between 1 and 128 characters',
  v => serverCommentLengthRegexp.test(v)
)

/**
 * CDN origin validator.
*/
const originRegexp = /^https?:\/\/((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}(\/.+)?/i
export const origin = helpers.withMessage(
  'Must be a valid URL',
  v => originRegexp.test(v)
)

/**
 * CDN integration ttl validator.
*/
export const isValidTtl = (ttl, minTtl, isGlobalPath) => {
  if (isGlobalPath) return ttl >= minTtl
  else return ttl === undefined || ttl === '' || ttl >= minTtl
}

/**
 * CDN integration path validator.
*/
export const integrationPath = helpers.withMessage(
  'Path must begin with / or a wildcard (*)',
  v => {
    try {
      validatePath(v)
      return true
    }
    catch (error) {
      return false
    }
  }
)
