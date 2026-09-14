import React, { FC, useEffect, useState } from 'react'
import { Button } from '@vkontakte/vkui'
import { useModal } from '@vkontakte-internal/messenger/dist/browser/hooks/useModal'
import { ShowHangupModalEventDetail } from 'vkme-common'
import { useBrowserEnv } from '@vkontakte-internal/messenger/dist/browser/hooks/misc'
import { UnifiedServiceModal } from '@vkontakte-internal/messenger/dist/browser/ui/UnifiedServiceModal/UnifiedServiceModal'
import { HangupType } from '@vkontakte/calls-sdk'

export const HangupCallsModal: FC = () => {
  const { lang } = useBrowserEnv()
  const modal = useModal()

  const closeHandler = () => modal.close()
  const [hangupType, setHangupType] = useState<HangupType | undefined>(
    undefined,
  )
  const [opponentName, setOpponentName] = useState<string>('')
  const [isMeEndedCallForAll, setIsMeEndedCallForAll] = useState<boolean>(false)
  const [customErrorMessage, setCustomErrorMessage] = useState<
    string | undefined
  >()

  /** заголовок модалки */
  let titleContent = ''
  /** текст модалки */
  let textContent = ''
  /** текст кнопки "закрыть" */
  // @ts-expect-error
  let btnText = lang?.use('calls_close')
  /** если не нужно показывать */
  let forceDisable = false

  switch (hangupType) {
    case HangupType.BUSY:
      // этих ленгов нет в оригинальном объекте ленгов для мессенджера. подмерживаем их в entryVKM.tsx
      // @ts-expect-error
      titleContent = lang?.use('calls_user_busy')
      // @ts-expect-error
      textContent = lang?.use('calls_user_busy_description').replace(
        '{username}',
        // @ts-expect-error
        opponentName || lang?.use('calls_opponent'),
      )
      break
    case HangupType.KILLED:
      if (isMeEndedCallForAll) {
        // если ты сам "закончил звонок для всех"
        forceDisable = true
        break
      }
      // @ts-expect-error
      titleContent = lang?.use('calls_join_error_not_found_conversation')
      // @ts-expect-error
      textContent = lang?.use('calls_admin_ended_call_for_everyone')
      break
    case HangupType.KILLED_WITHOUT_DELETE:
      if (isMeEndedCallForAll) {
        // если ты сам "отсоединил всех участников"
        forceDisable = true
        break
      }
      // @ts-expect-error
      titleContent = lang?.use('calls_meeting_ended_title')
      // @ts-expect-error
      textContent = lang?.use('calls_meeting_ended_desc')
      // @ts-expect-error
      btnText = lang?.use('calls_warning_ok')
      break
    case HangupType.BANNED:
      // @ts-expect-error
      titleContent = lang?.use('calls_call_is_interrupted')
      // @ts-expect-error
      textContent = lang?.use('calls_you_have_been_banned')
      break
    case HangupType.REMOVED:
      // @ts-expect-error
      titleContent = lang?.use('calls_call_is_interrupted')
      // @ts-expect-error
      textContent = lang?.use('calls_you_have_been_kicked')
      break
    case HangupType.ANOTHER_DEVICE:
      // @ts-expect-error
      titleContent = lang?.use('calls_call_is_interrupted')
      // @ts-expect-error
      textContent = lang?.use('calls_kicked_from_room_because_another_device')
      break
    default:
      if (customErrorMessage) {
        titleContent = lang?.use('calls_error')
        textContent = customErrorMessage
      }
      break
  }

  useEffect(() => {
    const openHangupModalListener = (options: ShowHangupModalEventDetail) => {
      const { hangupType, opponentName, isMeEndCallForAll, customError } =
        options
      setHangupType(hangupType)
      opponentName && setOpponentName(opponentName)
      isMeEndCallForAll && setIsMeEndedCallForAll(isMeEndCallForAll)
      setCustomErrorMessage(customError)
      modal.open()
    }

    window._calls.onShowHangupModal((options) => {
      openHangupModalListener(options)
    })
  }, [modal])

  return (
    <>
      {!forceDisable && modal.isActive && (
        <UnifiedServiceModal
          title={titleContent}
          subtitle={textContent}
          footer={
            <Button size="m" stretched onClick={closeHandler}>
              {btnText}
            </Button>
          }
          handleModalClose={closeHandler}
        />
      )}
    </>
  )
}
