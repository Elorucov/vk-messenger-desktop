import { contextBridge, ipcRenderer } from 'electron'
//import { WEBVIEW_CHANNEL } from 'vkme-common'

//TODO: удалить этот енам и вернуть импорт. сейчас к сожалению, если использовать импорт
// то будет ошибка, что не найден один из чанков
export const enum WEBVIEW_CHANNEL {
  CLOSE_REG_WEB_VIEW = 'CLOSE_REG_WEB_VIEW',
  CLOSE_REG_WEB_VIEW_WITH_AUTH = 'CLOSE_REG_WEB_VIEW_WITH_AUTH',
}

//@ts-expect-error
const api: Window['_regWebView'] = {
  close: () => ipcRenderer.invoke(WEBVIEW_CHANNEL.CLOSE_REG_WEB_VIEW),
  closeWithAuth: (url: string) =>
    ipcRenderer.invoke(WEBVIEW_CHANNEL.CLOSE_REG_WEB_VIEW_WITH_AUTH, url),
}

document.addEventListener('DOMContentLoaded', () => {
  addStyles()
  renderCloseButton()
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      api.close()
    }
  })

  //@ts-expect-error
  navigation.addEventListener('navigate', (e) => {
    if (e.destination.url.startsWith('vk://')) {
      e.preventDefault()
      api.closeWithAuth(e.destination.url)
    }
  })
})

function renderCloseIcon() {
  const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const iconPath = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'path',
  )

  iconSvg.setAttribute('fill', 'none')
  iconSvg.setAttribute('viewBox', '0 0 24 24')
  iconSvg.setAttribute('stroke', 'none')
  iconSvg.setAttribute('width', '24')
  iconSvg.setAttribute('height', '24')

  iconPath.setAttribute(
    'd',
    'M7.536 6.264a.9.9 0 0 0-1.272 1.272L10.727 12l-4.463 4.464a.9.9 0 0 0 1.272 1.272L12 13.273l4.464 4.463a.9.9 0 1 0 1.272-1.272L13.273 12l4.463-4.464a.9.9 0 1 0-1.272-1.272L12 10.727z',
  )
  iconPath.setAttribute('fill', 'currentColor')
  iconPath.setAttribute('fill-rule', 'evenodd')
  iconPath.setAttribute('clip-rule', 'evenodd')

  iconSvg.appendChild(iconPath)

  return iconSvg
}

const renderCloseButton = () => {
  const body = document.getElementsByTagName('body')[0]
  const closeButton = document.createElement('button')
  closeButton.setAttribute('class', 'CloseButton')
  closeButton.addEventListener('click', api.close, { once: true })

  closeButton.appendChild(renderCloseIcon())
  body?.appendChild(closeButton)
}

const addStyles = () => {
  const css = `
    .CloseButton {
      top: 15px;
      right: 15px;
      position: absolute;
      background: none;
      border: none;
      color: rgb(129, 140, 153);
      opacity: 0.7;
      z-index: 1;
      cursor: pointer;
    }

    .CloseButton:hover {
      opacity: 1;
    }
  `
  const style = document.createElement('style')
  style.innerHTML = css

  document.getElementsByTagName('head')[0]?.appendChild(style)
}

contextBridge.exposeInMainWorld('_regWebView', api)
