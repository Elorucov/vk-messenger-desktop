import React, { memo, useEffect, useState } from 'react'
import { CallsEvent, CallsWindowToggleEventListener } from 'vkme-common'
import { useRouter } from '@vkontakte-internal/messenger/dist/browser/ui/Router/Router'

import './activeCallPanel.css'
import { useLang } from '../../../../hooks/useLang'

type ActiveCallPanelProps = {
  isVerticalFoldersView: boolean
}

const ActiveCallPanelComponent: React.FC<ActiveCallPanelProps> = ({
  isVerticalFoldersView,
}) => {
  const [isCallActive, setIsCallActive] = useState(false)
  const { screenRoute } = useRouter()
  const lang = useLang()

  const isVisible = isCallActive && screenRoute.kind !== 'SettingsRoute'

  const showCall = (): void => {
    window._calls.window.focus()
  }

  useEffect(() => {
    const handleToggle: CallsWindowToggleEventListener = (event) => {
      const state = event.detail.state
      setIsCallActive(state !== 'none')
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

  return isVisible ? (
    <button
      style={{
        maxWidth: isVerticalFoldersView ? 487 : 400,
        minWidth: isVerticalFoldersView ? 408 : 320,
        width: isVerticalFoldersView ? '40%' : '35%',
      }}
      className="active-call-panel"
      onClick={() => showCall()}
    >
      {lang.use('me_return_to_call')}
    </button>
  ) : null
}

export const ActiveCallPanel = memo(ActiveCallPanelComponent)
