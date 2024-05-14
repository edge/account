export function arrayToObject(obj, value) {
  obj[value] = value
  return obj
}

const reduce = {
  arrayToObject
}

export default reduce
