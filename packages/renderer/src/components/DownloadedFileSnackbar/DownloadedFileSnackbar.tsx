import React, { FC } from 'react'
import { Paragraph, Subhead } from '@vkontakte/vkui'
import './DownloadedFileSnackbar.css'

type DownloadedFileSnackbarContentProps = {
  title: string
  message: string
  size?: string
  mode?: 'normal' | 'destructive'
}

const DownloadedFileSnackbarContent: FC<DownloadedFileSnackbarContentProps> = ({
  title,
  message,
  mode = 'normal',
  size,
}) => (
  <>
    <Paragraph className="file_downloaded_snackbar__paragraph" maxLength={30}>
      {title}
    </Paragraph>
    <Subhead className="file_downloaded_snackbar__subhead">
      <span
        className={
          mode === 'destructive'
            ? 'file_downloaded_snackbar__subhead--destructive'
            : undefined
        }
      >
        {message}
      </span>
      {size && <span>&nbsp;{size}</span>}
    </Subhead>
  </>
)

export { DownloadedFileSnackbarContent }
