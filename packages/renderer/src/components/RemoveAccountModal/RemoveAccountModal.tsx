import React, { ChangeEvent, FC, useEffect, useState } from 'react'
import {
  useBrowserEnv,
  useViewer,
} from '@vkontakte-internal/messenger/dist/browser/hooks/misc'
import { ModalInterface } from '@vkontakte-internal/messenger/dist/browser/ui/ModalInterface/ModalInterface'
import {
  Button,
  FormItem,
  FormLayoutGroup,
  Radio,
  Spinner,
  Textarea,
} from '@vkontakte/vkui'
import * as Viewer from '@vkontakte-internal/messenger/dist/core/model/Viewer'
import { useSnackbar } from '@vkontakte-internal/messenger'
import { Icon28ErrorCircleOutline } from '@vkontakte/icons'
import { EducationDeactivateReasonsResponse } from '@vkontakte-internal/api-schema-typescript'
import { useRouter } from '@vkontakte-internal/messenger/dist/browser/ui/Router/Router'
import './RemoveAccountModal.css'

type Props = {
  onClose: VoidFunction
  onLogout: () => Promise<void>
}

export const RemoveAccountModal: FC<Props> = ({ onClose, onLogout }) => {
  const { lang, api } = useBrowserEnv()
  const { profileType } = useViewer()
  const { navigate } = useRouter()
  const isEdu = Viewer.isEdu(profileType)
  const snackbar = useSnackbar()
  const [reasonsData, setReasonsData] =
    useState<EducationDeactivateReasonsResponse | null>(null)
  const [selectedReason, selectReason] = useState<number | null>(null)
  const [ownReasonText, setOwnReasonText] = useState('')

  useEffect(() => {
    if (isEdu) {
      api
        // @ts-expect-error
        .fetch('education.deactivateReasons', {})
        .then(setReasonsData)
    }
  }, [isEdu, api])

  const handleConfirmDeleteAccount = async () => {
    try {
      navigate({ kind: 'MainRoute' })
      if (isEdu) {
        await api
          //@ts-expect-error
          .fetch('education.deactivateUser', {
            reason: selectedReason,
            text: ownReasonText,
            hash: reasonsData?.hash,
          })
          .then(setReasonsData)
      } else {
        // эндпоинта нет в либе мессендждера
        // @ts-expect-error
        await api.fetch('account.deactivate', {})
      }

      await onLogout()
    } catch {
      snackbar({
        id: 'auth-error',
        autoClose: true,
        before: (
          <Icon28ErrorCircleOutline
            style={{ color: 'var(--vkui--color_icon_negative)' }}
          />
        ),
        message: lang.use('me_delete_account_error'),
      })
    }
  }
  const until = new Date().setDate(new Date().getDate() + 210)
  const isSubmitDisabled =
    isEdu && (!selectedReason || (selectedReason === 6 && ownReasonText === ''))

  const handleReasonChange = (e: ChangeEvent<HTMLInputElement>) => {
    selectReason(+e.target.value)
  }
  const handleOwnReasonText = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setOwnReasonText(e.target.value)
  }

  return (
    <ModalInterface
      onClose={onClose}
      closeLabel={lang.use('me_close')}
      contextClass="MEConfig"
      panelClass="RemoveAccountModal"
      title={
        isEdu
          ? lang.use('me_delete_edu_account_title')
          : lang.use('me_delete_account_title')
      }
      withCustomLayout={isEdu}
      buttons={
        <>
          <Button mode="secondary" onClick={onClose}>
            {lang.use('global_cancel')}
          </Button>
          <Button
            onClick={handleConfirmDeleteAccount}
            disabled={isSubmitDisabled}
          >
            {isEdu
              ? lang.use('me_delete_edu_account_action')
              : lang.use('me_delete_account_action')}
          </Button>
        </>
      }
    >
      {isEdu ? (
        <div className="RemoveAccountModal__wrapper">
          <span className="RemoveAccountModal__header">
            {lang.use('me_delete_account_edu_warning', {
              values: { date: new Date(until).toLocaleDateString() },
            })}
          </span>
          <span className="RemoveAccountModal__information">
            {lang.use('me_delete_account_edu_removal_information')}
          </span>
          <FormItem top={lang.use('me_delete_edu_account_select_reasons')}>
            <>
              {(!reasonsData || reasonsData.reasons.length === 0) && (
                <Spinner size="m" className="RemoveAccountModal__spinner" />
              )}
              <FormLayoutGroup>
                {reasonsData?.reasons.map((reason) => (
                  <Radio
                    key={reason.value}
                    name="reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={handleReasonChange}
                  >
                    {reason.translate}
                  </Radio>
                ))}
              </FormLayoutGroup>
              {selectedReason === 6 && (
                <FormItem noPadding className="RemoveAccountModal__textarea">
                  <Textarea
                    getRef={(ref) => ref?.scrollIntoView()}
                    maxLength={500}
                    value={ownReasonText}
                    onChange={handleOwnReasonText}
                    placeholder={lang.use(
                      'me_delete_edu_account_other_reason_placeholder',
                    )}
                  />
                </FormItem>
              )}
            </>
          </FormItem>
        </div>
      ) : (
        lang.use('me_delete_account_subtitle')
      )}
    </ModalInterface>
  )
}
