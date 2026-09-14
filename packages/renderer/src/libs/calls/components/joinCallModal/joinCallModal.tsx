import React, { useEffect, useState } from 'react'
import {
  CallsEvent,
  JoinCallEventDetail,
  JoinCallEventListener,
} from 'vkme-common'
import { useModal } from '@vkontakte-internal/messenger/dist/browser/hooks/useModal'

import './joinCallModal.css'
import { commonLogger } from '../../../logger'
import { callsDecorator } from '../../callsDecorator'
import { Button, Checkbox, Title } from '@vkontakte/vkui'
import { ModalView } from '@vkontakte-internal/messenger/dist/browser/ui/ModalView/ModalView'
import { ModalBackdrop } from '@vkontakte-internal/messenger/dist/browser/ui/ModalBackdrop/ModalBackdrop'
import { ModalPanel } from '@vkontakte-internal/messenger/dist/browser/ui/ModalPanel/ModalPanel'
import { ModalHeader } from '@vkontakte-internal/messenger/dist/browser/ui/ModalHeader/ModalHeader'
import { ModalBody } from '@vkontakte-internal/messenger/dist/browser/ui/ModalBody/ModalBody'
import {
  Icon16Phone,
  Icon16Videocam,
  Icon28PhoneAddOutline,
} from '@vkontakte/icons'
import { useLang } from '../../../../hooks/useLang'

const scope = 'join call modal'

export const JoinCallModal: React.FC = () => {
  const modal = useModal()
  const lang = useLang()
  const [joinCallDetail, setJoinCallDetail] = useState<JoinCallEventDetail>()
  const [isAudioDisable, setIsAudioDisable] = useState(false)

  useEffect(() => {
    const handleToggle: JoinCallEventListener = (event) => {
      setJoinCallDetail(event.detail)
      modal.open()
    }

    document.addEventListener(
      CallsEvent.SHOW_JOIN_CALL_MODAL,
      handleToggle as EventListener,
    )

    return () => {
      document.removeEventListener(
        CallsEvent.SHOW_JOIN_CALL_MODAL,
        handleToggle as EventListener,
      )
    }
  }, [modal])

  const handleAudioToggle: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    setIsAudioDisable(event.target.checked)
  }

  const handleCall = (isWithVideo: boolean) => {
    modal.close()

    if (!joinCallDetail) {
      commonLogger.error(
        'renderer',
        scope,
        'calls method params is not defined, could not join call',
      )
      return
    }

    callsDecorator.joinCall(
      joinCallDetail.joinLink,
      joinCallDetail.entrypoint,
      isWithVideo,
      !isAudioDisable,
    )
  }

  return modal.isActive ? (
    <ModalView onEscape={modal.close}>
      <ModalBackdrop onClick={modal.close}>
        <ModalPanel className="JoinCallModal">
          <ModalHeader closeLabel={lang.use('me_close')} onClose={modal.close}>
            {lang.use('me_call_join_modal_title')}
          </ModalHeader>

          <ModalBody>
            <div className="JoinCallModal__icon">
              <Icon28PhoneAddOutline width={34} height={34} />
            </div>

            <Title level="3">{lang.use('me_group_call')}</Title>

            <div className="JoinCallModal__buttons">
              <Button
                size="m"
                before={<Icon16Videocam />}
                onClick={() => handleCall(true)}
              >
                {lang.use('me_call_join_button_video')}
              </Button>

              <Button onClick={() => handleCall(false)}>
                <Icon16Phone />
              </Button>
            </div>

            <Checkbox
              checked={isAudioDisable}
              onChange={handleAudioToggle}
              className="JoinCallModal__checkbox"
            >
              {lang.use('me_call_join_button_without_audio')}
            </Checkbox>
          </ModalBody>
        </ModalPanel>
      </ModalBackdrop>
    </ModalView>
  ) : null
}
