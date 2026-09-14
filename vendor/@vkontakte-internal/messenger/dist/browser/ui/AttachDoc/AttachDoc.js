import '../../ui/AttachDoc/AttachDoc.css'
import React, { useCallback, useId, useMemo } from 'react'
import * as Attach from '../../../core/model/Attach'
import {
  Icon24BooksOutline,
  Icon24DocumentListOutline,
  Icon24DocumentOutline,
  Icon24DocumentTextOutline,
  Icon24MusicOutline,
  Icon24PictureOutline,
  Icon24VideoOutline,
  Icon28ZipOutline,
} from '@vkontakte/icons'
import { ExternalLink } from '../../ui/Link/Link'
import { exhaustivenessCheck, formatFileSize } from '../../../core/utils/misc'
import cx from 'classnames'
import { useBrowserEnv, usePixelDensity } from '../../hooks/misc'
import { getExpectedAttachWidth } from '../../utils/misc'
import { AttachDocPreview } from '../../ui/AttachDocPreview/AttachDocPreview'
import { useModal } from '../../hooks/useModal'
import { Button } from '@vkontakte/vkui'
import { AttachmentCell } from '../../ui/AttachmentCell/AttachmentCell'
import { FormattedLangKey } from '../../ui/FormattedLangKey/FormattedLangKey'
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop'
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel'
import { ModalView } from '../../ui/ModalView/ModalView'
import { ModalHeader } from '../../ui/ModalHeader/ModalHeader'
import { ModalBody } from '../../ui/ModalBody/ModalBody'
import { ModalFooter } from '../../ui/ModalFooter/ModalFooter'
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider'
export const AttachDoc = ({
  doc,
  variant = 'inline',
  isInBubble = false,
  forwardLevel = 0,
  isOut = false,
  className,
  subtitle,
  isClickDisabled = false,
}) => {
  const isDense = usePixelDensity()
  const [, photoSize] = getExpectedAttachWidth(
    isDense,
    isInBubble,
    forwardLevel,
    232,
  )
  const unsafeModal = useModal()
  const { shouldOpenFilesPreview } = useBrowserEnv()
  const { isMobileLayout } = useLayoutData()
  const handleClick = useCallback(
    (event) => {
      if (!doc.isUnsafe) {
        event.preventDefault()
        window._downloader.downloadAttach(doc)
        return
      }
      // Реагируем только на нажатие левой или средней кнопки мыши
      if (event.button !== 0 && event.button !== 1) {
        return
      }
      event.preventDefault()
      unsafeModal.open()
    },
    [doc.isUnsafe, unsafeModal],
  )
  const previewPhoto = Attach.preview(doc, photoSize)
  const meta = [doc.ext.toUpperCase(), formatFileSize(doc.size)]
  const docIcon = useMemo(() => {
    switch (doc.type) {
      case 'spreadsheet':
        return React.createElement(Icon24DocumentListOutline, null)
      case 'audio':
        return React.createElement(Icon24MusicOutline, null)
      case 'video':
        return React.createElement(Icon24VideoOutline, null)
      case 'image':
      case 'gif':
        return React.createElement(Icon24PictureOutline, null)
      case 'ebook':
        return React.createElement(Icon24BooksOutline, null)
      case 'archive':
        // TODO заменить на Icon24ZipOutline когда она появится
        return React.createElement(Icon28ZipOutline, { width: 24 })
      case 'text':
        return React.createElement(Icon24DocumentTextOutline, null)
      case 'default':
        return React.createElement(Icon24DocumentOutline, null)
      default:
        exhaustivenessCheck(doc.type)
    }
  }, [doc.type])
  if (variant === 'preview' && doc.image) {
    /**
     * Attach с превью: PNG, JPG, WEBP, GIF и тд
     */
    return React.createElement(AttachDocPreview, {
      doc: doc,
      meta: subtitle,
      isInBubble: isInBubble,
      forwardLevel: forwardLevel,
    })
  }
  const docUrl = shouldOpenFilesPreview
    ? Attach.overrideUrlForPreview(doc, isMobileLayout)
    : doc.url
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      ExternalLink,
      {
        onClick: handleClick,
        onAuxClick: handleClick,
        disabled: isClickDisabled,
        href: docUrl,
        className: cx('AttachDoc', className),
      },
      React.createElement(AttachmentCell, {
        isInBubble: isInBubble,
        isOut: isOut,
        image: previewPhoto ? previewPhoto.url : docIcon,
        title: doc.title,
        subtitle: subtitle || meta,
        alt: doc.title,
      }),
    ),
    unsafeModal.isActive &&
      React.createElement(UnsafeFileModal, {
        onClose: unsafeModal.close,
        title: doc.title,
        url: docUrl,
      }),
  )
}
const UnsafeFileModal = ({ onClose, url, title }) => {
  const { lang } = useBrowserEnv()
  const modalTitleId = useId()
  return React.createElement(
    ModalView,
    { onEscape: onClose, contextClass: 'MEConfig' },
    React.createElement(
      ModalBackdrop,
      { onClick: onClose },
      React.createElement(
        ModalPanel,
        { className: 'AttachDoc__unsafe-modal', ariaLabelledby: modalTitleId },
        React.createElement(ModalHeader, {
          closeLabel: lang.use('me_close'),
          onClose: onClose,
          title: lang.use('me_download_unsafe_title'),
          titleId: modalTitleId,
        }),
        React.createElement(
          ModalBody,
          null,
          React.createElement(FormattedLangKey, {
            langkey: 'me_download_unsafe_text',
            values: {
              filename: React.createElement(
                'b',
                { className: 'AttachDoc__unsafe-filename' },
                title,
              ),
            },
          }),
        ),
        React.createElement(ModalFooter, {
          buttons: [
            React.createElement(
              Button,
              { mode: 'tertiary', key: 'cancel', onClick: onClose },
              lang.use('me_cancel'),
            ),
            React.createElement(
              Button,
              {
                href: url,
                download: true,
                mode: 'primary',
                onClick: onClose,
                key: 'download',
              },
              lang.use('me_download'),
            ),
          ],
        }),
      ),
    ),
  )
}
//# sourceMappingURL=AttachDoc.js.map
