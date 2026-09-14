import '../../ui/AttachDocPreview/AttachDocPreview.css'
import React, { useState, useEffect } from 'react'
import * as Attach from '../../../core/model/Attach'
import { ExternalLink } from '../../ui/Link/Link'
import { ComposerAttachPreviewMeta } from '../../ui/ComposerAttachPreviewMeta/ComposerAttachPreviewMeta'
import {
  Icon24AddOutline,
  Icon24DoneOutline,
  Icon24Play,
} from '@vkontakte/icons'
import {
  useBrowserEnv,
  useFeatureFlags,
  usePixelDensity,
  useViewer,
} from '../../hooks/misc'
import {
  applySizeLimitations,
  getAttachForwardIndent,
  getExpectedAttachWidth,
} from '../../utils/misc'
import { PhotoItem } from '../../ui/PhotoItem/PhotoItem'
import { formatFileSize } from '../../../core/utils/misc'
import { useImagesLayout } from '../../ui/ConvoHistory/ImagesLayoutContext'
import { useInView } from 'react-intersection-observer'
import { Spinner } from '@vkontakte/vkui'
import cx from 'classnames'
import { useSnackbar } from '../../hooks/useSnackbar'
import { Tooltip } from '../../ui/Tooltip/Tooltip'
import { useApiFetch } from '../../hooks/useApiFetch'
const MIN_SINGLE_IMAGE_WIDTH = 120
const MIN_SINGLE_IMAGE_HEIGHT = 120
export const AttachDocPreview = ({
  doc,
  meta,
  width,
  height,
  isInBubble = false,
  forwardLevel = 0,
  isTheOnlyAttach,
  className,
}) => {
  const { lang } = useBrowserEnv()
  const apiFetch = useApiFetch()
  const isDense = usePixelDensity()
  const viewer = useViewer()
  const featureFlags = useFeatureFlags()
  const snackbar = useSnackbar()
  const isGif = doc.ext === 'gif'
  const [isGifPlay, setGifPlay] = useState(false)
  const [isGifSaved, setGifSaved] = useState(false)
  const [savedGifId, setSavedGifId] = useState(null)
  const { ref, inView } = useInView({
    threshold: 0.25,
    skip: !featureFlags.vkm_gifs_autoplay || !isTheOnlyAttach || !isGif,
  })
  useEffect(() => {
    setGifPlay(inView)
  }, [inView])
  const defaultMeta = [doc.ext.toUpperCase(), formatFileSize(doc.size)].join(
    ' · ',
  )
  const forwardIndent = getAttachForwardIndent(forwardLevel)
  const { width: availableWidth } = useImagesLayout()
  const [displaySize, photoSize] = getExpectedAttachWidth(
    isDense,
    isInBubble,
    forwardLevel,
    availableWidth - forwardIndent,
  )
  const previewPhoto = Attach.preview(doc, photoSize)
  if (!previewPhoto) {
    return null
  }
  const { width: w, height: h } = applySizeLimitations(
    previewPhoto.width,
    previewPhoto.height,
    displaySize,
    displaySize,
    MIN_SINGLE_IMAGE_WIDTH,
    MIN_SINGLE_IMAGE_HEIGHT,
  )
  const onClickGif = (event) => {
    setGifPlay((prevState) => !prevState)
    // Не открываем ссылку
    event.preventDefault()
  }
  const onSave = async (event) => {
    event.stopPropagation()
    event.preventDefault()
    if (isGifSaved === 'loading') {
      return
    }
    const isDeleteAction = savedGifId !== null
    try {
      setGifSaved('loading')
      if (isDeleteAction) {
        await apiFetch('docs.delete', {
          doc_id: savedGifId,
          owner_id: viewer.id,
        })
        setGifSaved(false)
        setSavedGifId(null)
      } else {
        const id = await apiFetch('docs.add', {
          doc_id: doc.id,
          owner_id: doc.ownerId,
          access_key: doc.accessKey,
        })
        setGifSaved(true)
        setSavedGifId(id)
      }
    } catch {
      setGifSaved(isDeleteAction)
      snackbar({
        message: isDeleteAction
          ? lang.use('me_doc_delete_error')
          : lang.use('me_doc_add_error'),
      })
    }
  }

  const onDocClick = (event) => {
    event.preventDefault()
    window._downloader.downloadAttach(doc)
  }

  return React.createElement(
    ExternalLink,
    {
      href: doc.url,
      className: cx('AttachDocPreview', {
        'AttachDocPreview--playing': isGifPlay,
      }),
      style: {
        width: width || w,
        height: height || h,
      },
      onClick: isGif ? onClickGif : onDocClick,
      target: isGif ? '_self' : '_blank',
      ref: ref,
    },
    React.createElement(PhotoItem, {
      alt: doc.title,
      src: isGifPlay ? doc.url : previewPhoto.url,
      width: width || w,
      height: height || h,
      withLoader: isGifPlay,
      className: className,
    }),
    isGif &&
      !isGifPlay &&
      React.createElement(
        'div',
        { className: 'AttachDocPreview__play' },
        React.createElement(Icon24Play, null),
      ),
    React.createElement(
      ComposerAttachPreviewMeta,
      {
        className: 'AttachDocPreview__metaWrapper',
        rounded: true,
        top: true,
        left: true,
      },
      React.createElement(
        'span',
        { className: 'AttachDocPreview__meta' },
        meta || defaultMeta,
      ),
    ),
    isGif &&
      isTheOnlyAttach &&
      doc.ownerId !== viewer.id &&
      React.createElement(
        Tooltip,
        {
          content:
            isGifSaved === true
              ? lang.use('me_added_to_docs_tooltip')
              : lang.use('me_add_to_docs_tooltip'),
          delay: 500,
          tooltipClassName: 'AttachDocPreview__saveTooltip',
          position: 'bottom',
          align: 'right',
          arrowOffset: { x: -4 },
          vkuiStyle: true,
          watchContentChange: true,
        },
        React.createElement(
          'button',
          { className: 'AttachDocPreview__saveButton', onClick: onSave },
          isGifSaved === false && React.createElement(Icon24AddOutline, null),
          isGifSaved === 'loading' &&
            React.createElement(Spinner, {
              className: 'AttachDocPreview__saveSpinner',
            }),
          isGifSaved === true && React.createElement(Icon24DoneOutline, null),
        ),
      ),
  )
}
//# sourceMappingURL=AttachDocPreview.js.map
