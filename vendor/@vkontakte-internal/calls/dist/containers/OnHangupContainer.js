import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTypedDispatch } from '../hooks/useTypedDispatch';
import { OnHangupModal } from '../components/OnHangupModal/OnHangupModal';
import { useCloseModal } from '../hooks/useCloseModal';
import { useLang } from '../hooks/useLang';
import { E_ACTION } from '../constants';
import { HangupType } from '@vkontakte/calls-sdk';
export const OnHangupContainer = ({ hangupType, isWaitingHall }) => {
    const { getLang } = useLang();
    const onClose = useCloseModal();
    const opponentName = useSelector((state) => state.lastCallData?.opponentName);
    const isMeEndedCallForAll = useSelector((state) => state.lastCallData?.isMeEndedCallForAll);
    const dispatch = useTypedDispatch();
    /** заголовок модалки */
    let titleContent = '';
    /** текст модалки */
    let textContent = '';
    /** текст кнопки "закрыть" */
    let btnText = getLang('calls_close');
    /** если не нужно показывать */
    let forceDisable = false;
    switch (hangupType) {
        case HangupType.BUSY:
            titleContent = getLang('calls_user_busy');
            textContent = getLang('calls_user_busy_description').replace('{username}', opponentName || getLang('calls_opponent'));
            break;
        case HangupType.KILLED:
            if (isMeEndedCallForAll) {
                // если ты сам "закончил звонок для всех"
                forceDisable = true;
                break;
            }
            titleContent = getLang('calls_join_error_not_found_conversation');
            textContent = getLang('calls_admin_ended_call_for_everyone');
            break;
        case HangupType.KILLED_WITHOUT_DELETE:
            if (isMeEndedCallForAll) {
                // если ты сам "отсоединил всех участников"
                forceDisable = true;
                break;
            }
            titleContent = getLang('calls_meeting_ended_title');
            textContent = getLang('calls_meeting_ended_desc');
            btnText = getLang('calls_warning_ok');
            break;
        case HangupType.BANNED:
            titleContent = getLang('calls_call_is_interrupted');
            textContent = getLang('calls_you_have_been_banned');
            break;
        case HangupType.REMOVED:
            if (isWaitingHall) {
                titleContent = getLang('calls_failed_to_connect');
                textContent = getLang('calls_enter_not_allowed');
            }
            else {
                titleContent = getLang('calls_call_is_interrupted');
                textContent = getLang('calls_you_have_been_kicked');
            }
            break;
        case HangupType.ANOTHER_DEVICE:
            titleContent = getLang('calls_call_is_interrupted');
            textContent = getLang('calls_kicked_because_another_device');
            break;
    }
    useEffect(() => {
        return () => {
            // cleanup lastCallData state on unmount
            dispatch({ type: E_ACTION.CLEAN_LAST_CALL_DATA });
        };
    }, []);
    useEffect(() => {
        if (forceDisable) {
            // если модальное окно нужно выключить, то вызываем метод после рендера
            onClose();
        }
    }, [forceDisable, onClose]);
    return forceDisable ? (_jsx(_Fragment, {})) : titleContent && textContent ? (_jsx(OnHangupModal, { onClose: onClose, title: titleContent, description: textContent, btnText: btnText })) : null;
};
//# sourceMappingURL=OnHangupContainer.js.map