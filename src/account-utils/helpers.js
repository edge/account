// Transform any simple object into a query string for use in URLs.
export const toQueryString = data => Object.keys(data)
  .map(key => {
    const v = data[key]
    if (v instanceof Array) return `${key}=${v.map(urlsafe).join(',')}`
    return `${key}=${urlsafe(v)}`
  })
  .join('&')

// Sanitize a value for use in URLs.
export const urlsafe = v => {
  if (typeof v === 'string') return v.replace(/ /g, '%20')
  return `${v}`
}
