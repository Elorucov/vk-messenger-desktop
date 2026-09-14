import { debounce } from '@vkontakte-internal/messenger/dist/core/utils/misc'
import { useLayoutEffect, useRef, useState } from 'react'

function getViewportSize(): [number, number] {
  if (typeof window === 'undefined' || !window?._mediaWindow) {
    return [0, 0]
  }

  return [
    window._mediaWindow.document.documentElement.clientWidth,
    window._mediaWindow.document.documentElement.clientHeight,
  ]
}

export function useMediaViewport({
  debounced = false,
}: {
  debounced: boolean
}): [number, number] {
  const [viewportSize, setViewportSize] =
    useState<[number, number]>(getViewportSize)

  const setViewportSizeDebouncedRef = useRef(
    debounce(setViewportSize, 300, false),
  )

  useLayoutEffect(() => {
    const setViewportSizeDebounced = setViewportSizeDebouncedRef.current
    const onResize = () => {
      if (debounced) {
        setViewportSizeDebounced(getViewportSize())
      } else {
        setViewportSize(getViewportSize())
      }
    }

    window._mediaWindow?.addEventListener('resize', onResize)

    return () => {
      window._mediaWindow?.removeEventListener('resize', onResize)
      if (debounced) {
        setViewportSizeDebounced.cancel()
      }
    }
  }, [debounced])

  return viewportSize
}
