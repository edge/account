import moment from 'moment'
moment.locale('en-GB')

/**
 * add spaces to account number for presentational purposes
 * @param {*} accountNumber account number string with no spaces
 * @return {string} account number with spaces every 4 characters
 */
export const accountNumber = (accountNumber) => accountNumber.toString().replace(/.{4}/g, '$& ')


/**
 * mask first 12 digits of an account number
 * @param {*} accountNumber account number string with no spaces
 * @return {string} with 12 Xs and final 4 digits of account number
 */
export const accountNumberMasked = (accountNumber) => `XXXX XXXX XXXX ${accountNumber.slice(-4)}`


/**
 * convert a timestamp to formatted date
 * @param {*} timestamp
 * @returns date formatted as 7 July 2022
 */
export const date = (timestamp) => moment(timestamp).format('LL')

/**
 * format MiB value to either MiB or GiB (when above 1024)
 * @param {*} MiB value in MiB
 * @return {string} value in MiB or GiB with correct units
 */
export const mib = (MiB) => {
  if (MiB / 1024 % 0 === 0) return `${MiB / 1024} GiB`
  return `${MiB} MiB`
}

/**
 * remove spaces from a string
 * used to convert a presentational string (account number or totp) to a string with no spaces
 * @param {*} stringWithSpaces account number or totp value with spaces
 * @return {string} same string with spaces removed (e.g. "1 2 3 4 5 6" -> "123456")
 */
export const removeSpaces = (stringWithSpaces) => stringWithSpaces.split(' ').join('')


/**
 * convert a timestamp to formatted date
 * @param {*} timestamp
 * @param {boolean} includeSeconds whether to include seconds or now
 * @returns time formatted as HH:MM or HH:MM::SS
 */
export const time = (timestamp, includeSeconds) => {
  const formatCode = includeSeconds ? 'LTS' : 'LT'
  return moment(timestamp).format(formatCode)
}


/**
 * round an amount in dollars to a set number of decimal places
 * @param {*} amount amount in united states dollars
 * @param {*} decimalPlaces number of decimal places to round to
 * @return {string} usd value to set number of decimal places with no units (neither $ nor USD)
 */
export const usd = (amount, decimalPlaces) => {
  const multiplier = 1 * (10 ** decimalPlaces)
  return (Math.round(amount * multiplier) / multiplier).toLocaleString(undefined, {
    maximumFractionDigits: decimalPlaces,
    minimumFractionDigits: decimalPlaces
  })
}


/**
 * format an xe amount to micro xe
 * return value doesn't include any units (XE)
 * @param {*} amount amount in united states dollars
 * @return {string} value with 6 decimal places (e.g. 1000000 -> 1.000000)
 */
export const xe = (amount) => (amount / 1e6).toLocaleString(undefined, {
  maximumFractionDigits: 6,
  minimumFractionDigits: 6
})

