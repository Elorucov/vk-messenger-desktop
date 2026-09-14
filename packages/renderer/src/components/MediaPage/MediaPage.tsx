import React, { FC } from 'react'
import { SnackbarProvider } from '@vkontakte-internal/messenger/dist/browser/hooks/useSnackbar'
import { useDownloadSnackbar } from '../../hooks/useDownloadSnackbar'

export const MediaPage: FC = () => {
  useDownloadSnackbar()
  return (
    <React.StrictMode>
      <SnackbarProvider />
    </React.StrictMode>
  )
}
