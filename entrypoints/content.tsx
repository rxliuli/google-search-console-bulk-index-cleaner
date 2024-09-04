import { createRoot } from 'react-dom/client'
import { App } from './content/App'
import './content/style.css'
import { PortalContainer } from './content/components/3rd/PortalContainer'
import { wait } from '@liuli-util/async'

export default defineContentScript({
  matches: ['https://search.google.com/search-console/removals*'],
  cssInjectionMode: 'ui',
  async main(ctx) {
    console.log('Hello content.')
    await wait(
      () => !!document.querySelector('[jsaction="JIbuQc:CdtzTb(Hf7sUe)"]'),
    )
    const ui = await createShadowRootUi(ctx, {
      name: 'bulk-index-cleaner',
      position: 'inline',
      anchor() {
        return document.querySelector('[jsaction="JIbuQc:CdtzTb(Hf7sUe)"]')
      },
      onMount: (container) => {
        const app = document.createElement('div')
        container.append(app)

        // Create a root on the UI container and render a component
        const root = createRoot(app)
        root.render(
          <PortalContainer
            container={document
              .querySelector('bulk-index-cleaner')
              ?.shadowRoot?.querySelector('body')}
          >
            <App />
          </PortalContainer>,
        )
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
