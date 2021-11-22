const anyid = require('anyid')

/**
 * Returns a random id section 4 characters long.
 */
const getSection = parent => {
  return parent.anyid().length(4).random()
}

/**
 * Create the ID generator using the format `0000 0000 0000 0000`.
 * New ID values are created by calling `ids.id()`.
 */
const idGenerator = anyid
  .anyid()
  .encode('0')
  .section(getSection(anyid))
  .delimiter(' ')
  .section(getSection(anyid))
  .delimiter(' ')
  .section(getSection(anyid))
  .delimiter(' ')
  .section(getSection(anyid))

const getId = () => {
  return idGenerator.id()
}

export {
  getId
}
