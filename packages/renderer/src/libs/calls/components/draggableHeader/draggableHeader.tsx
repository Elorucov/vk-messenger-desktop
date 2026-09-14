import React, { useEffect, useState } from 'react'
import {
  CallsEvent,
  CallsWindowState,
  CallsWindowToggleEventListener,
} from 'vkme-common'

import './draggableHeader.css'

const availableStates: CallsWindowState[] = [
  'incoming',
  'mini-view',
  'normal',
  'join-popup',
]

export const DraggableHeader: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleToggle: CallsWindowToggleEventListener = (event) => {
      const state = event.detail.state
      setIsVisible(availableStates.includes(state))
    }

    document.addEventListener(
      CallsEvent.TOGGLE_CALLS_WINDOW_STATE,
      handleToggle as EventListener,
    )

    return () => {
      document.removeEventListener(
        CallsEvent.TOGGLE_CALLS_WINDOW_STATE,
        handleToggle as EventListener,
      )
    }
  }, [])

  return isVisible ? <div className="draggable-header" /> : null
}
