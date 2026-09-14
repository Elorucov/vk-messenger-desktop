import { useEffect, useMemo, useState } from 'react'
import { ISettings } from 'vkme-common'

type SettingsData = {
  state: ISettings['state']
  toggle: ISettings['toggle']
  platform: ISettings['platform']
}

function useSettings(): SettingsData {
  const [state, setState] = useState<ISettings['state']>(
    () => window['_settings'].state,
  )

  useEffect(() => {
    const unsub = window._settings.subscribe(setState)
    return () => {
      unsub()
    }
  }, [])

  const value: SettingsData = useMemo(
    () => ({
      state,
      toggle: window._settings.toggle,
      platform: window._settings.platform,
    }),
    [state],
  )

  return value
}

export { useSettings }
