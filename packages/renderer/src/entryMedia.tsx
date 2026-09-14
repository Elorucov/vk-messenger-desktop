import './media_base.css'
import './base.css'
import './vkui_me.css'
import '@vkontakte-internal/messenger/dist/browser/styles/base.css'
import '@vkontakte-internal/messenger/dist/browser/styles/colors.css'
import '@vkontakte-internal/messenger/dist/browser/styles/fonts.css'
import '@vkontakte-internal/messenger/dist/browser/styles/emoji.css'
import '@superappkit/superappkit-widgets/dist/styles.css'

import React from 'react'
import { createRoot } from 'react-dom/client'

import { MediaViewer } from './components/MediaRenderer/components/MediaViewer'
import { MediaPage } from './components/MediaPage/MediaPage'
import { IOverrideILang, snackbarStore } from '@vkontakte-internal/messenger'
import { webLogger } from './utils/api'
import { ElectronLang } from './env/ElectronLang'
import { LangProvider } from './hooks/useLang'

const scope = 'entryMedia'

const backdrop = document.querySelector('.MediaBackdrop__flesh')

window._media.unmount(() => {
  window._log.debug('renderer', scope, 'unmount')
  snackbarStore.reset()

  const mediaRoot = document.getElementById('media-root')

  if (mediaRoot) {
    mediaRoot.replaceChildren()
  }

  window._media.unmounted()
})

backdrop?.addEventListener('click', () => {
  // не через hide, чтобы различать источник
  window.close()
})

/**
 * Так как CSS не шарится между окнами, нам нужно, чтобы бандлер собрал его для нас.
 * Рендерить не нужно
 */
if (1 > 2) {
  const onClose = () => {}
  const element = document.getElementById('media-root')
  if (element) {
    const root = createRoot(element)
    root.render(
      <MediaViewer mediaItems={[]} onClose={onClose} withPhotoContextMenu />,
    )
  }
}

const element = document.getElementById('root')

if (element) {
  const root = createRoot(element)
  window._translations.getLang().then((translations) => {
    const lang = new ElectronLang(webLogger, translations) as IOverrideILang

    root.render(
      <LangProvider value={lang}>
        <MediaPage />
      </LangProvider>,
    )
  })
}
