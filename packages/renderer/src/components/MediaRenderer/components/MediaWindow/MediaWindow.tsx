import React, { useState } from 'react'
import { useEffect, ReactNode, ReactElement } from 'react'
import { MEDIA_WINDOW } from 'vkme-common'
import { createPortal } from 'react-dom'
import { ModalView } from '@vkontakte-internal/messenger/dist/browser/ui/ModalView/ModalView'
import { ModalBackdrop } from '@vkontakte-internal/messenger/dist/browser/ui/ModalBackdrop/ModalBackdrop'

type Props = {
  onClose: VoidFunction
  children: ReactNode | undefined
}

const scope = 'MediaWindow'

export const createMediaWindow = async (isInit?: boolean): Promise<void> => {
  if (window._mediaWindow) {
    if (!isInit) {
      window._media.restore()
    }
  } else {
    const location = await window._common.getHTMLPath('media.html')

    window._mediaWindow = window.open(location, '_blank')

    if (!window._mediaWindow) {
      throw new Error('Security restrictions check failed')
    }

    window._log.debug(
      'renderer',
      scope,
      'window',
      'created: ',
      Boolean(window._mediaWindow),
    )
  }

  syncTheme(window._mediaWindow)
}

const syncTheme = (mediaWindow: Window) => {
  mediaWindow.document.body.classList.remove(
    ...mediaWindow.document.body.classList,
  )
  if (document.body.classList.contains('vkui--vkBase--light')) {
    mediaWindow.document.body.classList.add('vkui--vkBase--light')
  }
  if (document.body.classList.contains('vkui--vkBase--dark')) {
    mediaWindow.document.body.classList.add('vkui--vkBase--dark')
  }
}

const appendOrReplaceNode = (node: HTMLElement, MediaWindow: Window) => {
  const clone = node.cloneNode(true)
  const childNode = MediaWindow.document.getElementById(node.id)

  if (childNode) {
    // копируем только те элементы, которые еще не были добавлены
    for (const child of clone.childNodes) {
      const el = child as HTMLElement
      if (el.id) {
        const sameEl = childNode.querySelector(`#${el.id}`)

        if (!sameEl) {
          childNode.appendChild(child)
        }
      }
    }
  } else {
    MediaWindow.document.body.appendChild(clone)
  }
}

/**
 * @vkontakte/icons при создании иконки помещает спрайт в отдельную ноду,
 * но т.к. портал рендерится в отдельном окне, нам нужно подписаться на изменение
 * спрайт ноды создавать аналогичные в окне. Указать сразу где создавать невозможно
 */
const listenForWindowChanges = (mediaWindow: Window) => {
  // Изменения спрайтов иконок
  const node = document.getElementById('__SVG_SPRITE_NODE__')

  if (!node) {
    throw new Error('Node not found')
  }

  appendOrReplaceNode(node, mediaWindow)

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((record) => {
      appendOrReplaceNode(record.target as HTMLElement, mediaWindow)
    })
  })

  observer.observe(node, { childList: true })

  // синхронизация темы
  const themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((record) => {
      if (record.attributeName === 'class') {
        syncTheme(mediaWindow)
      }
    })
  })

  themeObserver.observe(window.document.body, {
    attributes: true,
    attributeFilter: ['class'],
  })

  // также события нажатий клавиш
  const onKeydown = (event: KeyboardEvent) => {
    document.dispatchEvent(new KeyboardEvent(event.type, event))
  }

  /**
   * По какой то причине выход из фулскрина на ESC не триггерит document.exitfullscreen,
   * поэтому по косвенному признаку, webkitfullscreenchange событию, проверяем,
   * что fullscreenElement в медиа окне нет, а в главном есть и вручную закрываем
   */
  const onWebkitFullscrenChange = () => {
    window._log.debug('renderer', scope, 'webkit fullscreenchange handled')
    if (
      !Boolean(mediaWindow.document.fullscreenElement) &&
      Boolean(document.fullscreenElement)
    ) {
      document.exitFullscreen()
    }
  }

  /**
   * При создании мы не можем окна через window.open сразу подписаться на него,
   * потому что по какой то причине window.document является unknown.
   * Предполагаю, что это механика электрона и мы создаем слушатель до вызова BrowserWindow.loadFile(...)
   */
  const timeout = setTimeout(() => {
    mediaWindow.document.addEventListener('keydown', onKeydown)
    mediaWindow.document.addEventListener(
      'webkitfullscreenchange',
      onWebkitFullscrenChange,
    )
  }, 300)

  return () => {
    clearTimeout(timeout)
    mediaWindow.document.removeEventListener('keydown', onKeydown)
    mediaWindow.document.removeEventListener(
      'webkitfullscreenchange',
      onWebkitFullscrenChange,
    )
  }
}

export const MediaWindow = ({
  children,
  onClose,
}: Props): ReactElement | null => {
  const [externalWindow] = useState(window._mediaWindow)

  /**
   * Автозакрытие при закрытии окна
   * Вызывается на событие close, которое абортится и вызывается hide
   */
  useEffect(() => {
    window.addEventListener(MEDIA_WINDOW.ONCLOSE, onClose)
    return () => {
      window.removeEventListener(MEDIA_WINDOW.ONCLOSE, onClose)
    }
  }, [onClose])

  /**
   * Создание и закрытие окна
   */
  useEffect(() => {
    let unsub: VoidFunction

    const init = async () => {
      await createMediaWindow()

      if (window._mediaWindow) {
        unsub = listenForWindowChanges(window._mediaWindow)
      }
    }

    init()
    window._isMediaWindowOpened = true
    return () => {
      window._media.hide()
      unsub?.()
      window._isMediaWindowOpened = false
    }
  }, [])

  const root = externalWindow?.document.getElementById('media-root')

  if (!root) {
    return null
  }

  // оболочка предотвращает скролл и клики
  return (
    <ModalView>
      <ModalBackdrop isClear isBodyScrollDisabled>
        {createPortal(children, root)}
      </ModalBackdrop>
    </ModalView>
  )
}
