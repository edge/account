import * as libcrisp from '@/crisp'

export function useCrisp() {
  function open() {
    return libcrisp.session()
      // https://docs.crisp.chat/guides/chatbox-sdks/web-sdk/dollar-crisp/#open-chatbox
      .then(crisp => crisp.push(['do', 'chat:open']))
      .catch(err => console.error(err))
  }

  return { open }
}

export function useTitle() {
  function reset() {
    document.title = 'Edge Account Portal'
  }

  function set(title) {
    document.title = `Edge Account Portal » ${title}`
  }

  return { reset, set }
}
