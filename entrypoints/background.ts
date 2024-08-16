import { sendMessage } from './model/messaging'

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id })

  browser.action.onClicked.addListener(async (tab) => {
    if (
      !tab.url ||
      !tab.url.startsWith('https://search.google.com/search-console/removals')
    ) {
      return
    }
    await sendMessage('toggle', undefined, tab.id)
  })
})
