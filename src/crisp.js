let hasCrisp = false

export const endSession = () => {
  if (window.$crisp) {
    window.$crisp.push(['do', 'session:reset'])
  }
}

export const session = () => new Promise((resolve, reject) => {
  if (hasCrisp) return resolve(window.$crisp)
  // if Crisp is not set up at all, quietly resolve without error
  if (!window.CRISP_WEBSITE_ID) return resolve()

  let t = null
  let i = null
  const check = () => {
    if (window.$crisp) {
      clearInterval(i)
      clearTimeout(t)
      window.$crisp.push(['on', 'session:loaded', () => {
        hasCrisp = true
        resolve(window.$crisp)
      }])
      resolve(window.$crisp)
    }
  }
  i = setInterval(check, 50)
  t = setTimeout(() => {
    clearInterval(i)
    reject('$crisp not loaded in 10s')
  }, 10000)
})

export const setAccount = (account) => session()
  // https://docs.crisp.chat/guides/chatbox-sdks/web-sdk/dollar-crisp/#change-user-nickname
  .then(crisp => {
    if (!account || !crisp) return
    const name = crisp.get('user:nickname')
    if (!name || !/^XX[0-9]{2}-[0-9]{4}$/.test(name)) {
      const masked = `XX${account._key.slice(-6, -4)}-${account._key.slice(-4)}`
      crisp.push(['set', 'user:nickname', [masked]])
    }
  })
  .catch(err => console.error(err))

export const setSubscriptions = (subscriptions) => session()
  // https://docs.crisp.chat/guides/chatbox-sdks/web-sdk/dollar-crisp/#push-session-segments
  .then(crisp => {
    if (!crisp) return
    crisp.push(['set', 'session:segments', [['account', ...subscriptions.map(s => s.product)], true]])
  })
  .catch(err => console.error(err))
