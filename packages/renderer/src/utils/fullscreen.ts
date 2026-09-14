/**
 * Нам необходимо переопределить механизм фулскрина, поскольку
 * медиа окно рендерится в отдельном дереве, но модуль, который
 * его рендерит, живет в основном окне. В таком случае переопределяем
 * fullscreenElement, requestFullscreen и exitFullscreen и вызываем их
 * же во втором окне, иначе фалбэк на вебкитовский вариант этих же фукнций
 */
export const registerFullscreenController = (): void => {
  let fullscreenElement: HTMLElement

  Object.defineProperty(document, 'fullscreenElement', {
    get() {
      return fullscreenElement
    },
    set(value) {
      fullscreenElement = value
    },
  })

  Element.prototype.requestFullscreen = async function () {
    window._log.debug(
      'renderer',
      'registerFullscreenController',
      'requestFullscreen',
    )

    if (window._isMediaWindowOpened) {
      // @ts-expect-error - читай описание функции
      document.fullscreenElement = this
      document.dispatchEvent(new Event('fullscreenchange'))
    }
    // @ts-expect-error - читай описание функции
    return this.webkitRequestFullscreen()
  }

  document.exitFullscreen = async () => {
    window._log.debug(
      'renderer',
      'registerFullscreenController',
      'exitFullscreen',
    )

    if (window._isMediaWindowOpened && window._mediaWindow) {
      // @ts-expect-error - читай описание функции
      document.fullscreenElement = null
      document.dispatchEvent(new Event('fullscreenchange'))
      window._mediaWindow.document.exitFullscreen()
    } else {
      // @ts-expect-error - читай описание функции
      return document.webkitExitFullscreen()
    }
  }

  const onfullscreenchange2 = () => {
    window._log.info('renderer', 'onfullscreenchange2 window')
  }

  window?.document.addEventListener('fullscreenchange', onfullscreenchange2)
}
