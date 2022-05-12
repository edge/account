// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { email as _email, required as _required, helpers } from '@vuelidate/validators'

/**
 * Required value validator with a more attractive error message.
 */
export const required = helpers.withMessage('A value is required.', _required)

/**
 * Account number validator.
 */
const accountNumberRegexp = /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/
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
