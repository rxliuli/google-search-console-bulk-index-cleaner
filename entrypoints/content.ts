import { createRoot } from 'react-dom/client'
import { App } from './content/App'
import { createElement } from 'react'
import './content/style.css'

export default defineContentScript({
  matches: ['*://search.google.com/*'],
  cssInjectionMode: 'ui',
  async main(ctx) {
    console.log('Hello content.')
    const ui = await createShadowRootUi(ctx, {
      name: 'bulk-index-cleaner',
      position: 'inline',
      onMount: (container) => {
        const app = document.createElement('div')
        app.style.position = 'absolute'
        app.style.zIndex = '9999'
        container.append(app)

        // Create a root on the UI container and render a component
        const root = createRoot(app)
        root.render(createElement(App))
        return root
      },
      onRemove(root) {
        // Unmount the root when the UI is removed
        root?.unmount()
      },
    })
    ui.mount()
  },
})
