// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { required as _required, helpers } from '@vuelidate/validators'

/**
 * Required value validator with a more attractive error message.
 */
 export const required = helpers.withMessage('A value is required.', _required)

const accountNumberRegexp = /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/
/**
 * XE address validator.
 */
export const accountNumber = helpers.withMessage('Your account number is 16 digits', v => accountNumberRegexp.test(v))
