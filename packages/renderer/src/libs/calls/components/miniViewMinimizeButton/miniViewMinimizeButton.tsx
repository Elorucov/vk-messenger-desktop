import React, { useEffect, useState } from 'react'

import './miniViewMinimizeButton.css'
import { CallsEvent, CallsWindowState } from 'vkme-common'

export const MiniViewMinimizeButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)

  const minimize = (): void => {
    window._calls.window.minimize()
  }

  useEffect(() => {
    const toggleButton = (event: any) => {
      const state = event.detail.state as CallsWindowState
      setIsVisible(state === 'mini-view' || state === 'incoming')
    }

    document.addEventListener(
      CallsEvent.TOGGLE_CALLS_WINDOW_STATE,
      toggleButton,
    )

    return () => {
      document.removeEventListener(
        CallsEvent.TOGGLE_CALLS_WINDOW_STATE,
        toggleButton,
      )
    }
  }, [])

  return isVisible ? (
    <button className="mini-view-minimize-button" onClick={() => minimize()}>
      <div className="mini-view-minimize-button__icon" />
    </button>
  ) : null
}
