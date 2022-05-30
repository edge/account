// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { email as _email, required as _required, helpers } from '@vuelidate/validators'

/**
 * Required value validator with a more attractive error message than default.
 */
export const required = helpers.withMessage('A value is required.', _required)

/**
 * Account number validator.
 */
const accountNumberRegexp = /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/
// eslint-disable-next-line max-len
export const accountNumberInput = helpers.withMessage('Your account number is 16 digits', v => accountNumberRegexp.test(v))

/**
 * Email validator.
 */
export const email = helpers.withMessage('Please enter a valid email', _email)

/**
 * 6-digit confirmation code validator.
 */
const confCodeRegexp = /^\d{1}\s\d{1}\s\d{1}\s\d{1}\s\d{1}\s\d{1}$/
export const confirmationCode = helpers.withMessage('The confirmation code is 6 digits', v => confCodeRegexp.test(v))


/**
 * Server hostname validators.
 * - valid characters (alphanumeric, periods, underscores and hyphens)
 * - alphanumeric first character
 * - hostname length
 */
const hostnameCharsRegexp = /^[a-zA-Z0-9-_.]*$/
export const hostnameChars = helpers.withMessage(
  'Must contain only alphanumeric characters, periods, underscores, and hyphens',
  // don't display error if no value entered
  v => {
    if(v) return hostnameCharsRegexp.test(v)
    else return true
  }
)

const hostnameFirstCharRegexp = /^[a-zA-Z0-9]{1}/
export const hostnameFirstChar = helpers.withMessage(
  'The first character must be alphanumeric',
  // don't display error if no value entered
  v => {
    if(v) return hostnameFirstCharRegexp.test(v)
    else return true
  }
)

const hostnameLengthRegexp = /^.{1,48}$/
export const hostnameLength = helpers.withMessage(
  'Must be between 1 and 49 characters',
  v => hostnameLengthRegexp.test(v)
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
const domainRegexp = /^.{6,255}$/
export const domain = helpers.withMessage(
  'Maximum length is 255 characters.',
  v => domainRegexp.test(v)
)
