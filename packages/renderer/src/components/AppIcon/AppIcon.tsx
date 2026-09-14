import React, { FC } from 'react'
import { useLang } from '../../hooks/useLang'

interface AppIconProps {
  width?: string | number | undefined
}

export const AppIcon: FC<AppIconProps> = ({ width }) => {
  const lang = useLang()
  return (
    <>
      <img
        width={width}
        src={new URL('/icons/logo_vk_me.svg', import.meta.url).href}
        aria-hidden={true}
        aria-label={lang.use('me_vkme_title')}
      />
    </>
  )
}
