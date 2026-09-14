import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useMemo, useState } from 'react';
import { ModalRescheduleCall } from '../components/ModalRescheduleCall/ModalRescheduleCall';
import { ModalDeleteCall } from '../components/ModalDeleteCall/ModalDeleteCall';
import { ModalScheduleCall, getUserSelectOptions, mapFormData, mapBroadcastFormData, useHandleSuccessScheduleCall, } from '../components/ModalScheduleCall';
import { EHistoryScreenPopup, useCallsBridge, } from '@vkontakte-internal/calls-core';
import { handlePromiseError } from '../helpers/logger';
import { messagesDeleteScheduledCall, messagesEditCall, videoEditStreaming } from '../services/backend';
import { useIsMounted } from '@vkontakte-internal/react-utils';
import { useFetchData } from '../hooks/useFetchData';
import { usePromiseError } from '../hooks/usePromiseError';
import { useCreateScheduleCallValidator } from '../hooks/useCreateScheduleCallValidator';
import { updateBroadcastId } from '@vkontakte-internal/calls-core';
import { useConfig } from '../services/config';
import { useLang } from '../hooks/useLang';
import { useCloseModal } from '../hooks/useCloseModal';
/**
 * Контейнер-контроллер редактирования запланированного звока
 */
export const ModalEditCalendarEventContainer = ({ popup: initialPopup, scheduledEditableCall: call, meParticipant, callParticipant, onClose, }) => {
    const isMounted = useIsMounted();
    const config = useConfig();
    const langs = useLang();
    const { handleError } = usePromiseError();
    const validator = useCreateScheduleCallValidator();
    const bridge = useCallsBridge();
    const postEditCall = useFetchData({ cb: messagesEditCall });
    const postDeleteCall = useFetchData({ cb: messagesDeleteScheduledCall });
    /** список создателей (в который кладем только создателя выбранного звонка) */
    const userSelectOptions = useMemo(() => {
        return getUserSelectOptions(callParticipant);
    }, [callParticipant]);
    const handleSuccessScheduleCall = useHandleSuccessScheduleCall({
        me: meParticipant,
        isSferum: config.sferum,
    });
    const closeModal = useCloseModal();
    const closePopup = useCallback(() => {
        closeModal();
        onClose();
    }, [closeModal, onClose]);
    /** перенос звонка */
    const [popup, setPopup] = useState(initialPopup);
    const handleRescheduleCall = useCallback(() => {
        setPopup(EHistoryScreenPopup.RescheduleCalendarEvent);
    }, []);
    /** редактирование звонка */
    const fetchEditCall = useCallback((params, broadcastParams) => {
        const isValid = validator(params, broadcastParams);
        if (!call || !isValid) {
            return;
        }
        const editCall = (editStreamingResponse) => {
            params.broadcastId = updateBroadcastId(editStreamingResponse, params.broadcastId);
            return postEditCall
                .fetchData(mapFormData(params, call))
                .then(() => {
                if (!isMounted()) {
                    return;
                }
                handleSuccessScheduleCall({
                    params,
                    call,
                    closePopup,
                    setPlannedCalendarEvent: (event) => {
                        bridge.setPlannedCalendarEvent?.(event);
                    },
                });
            })
                .catch(handleError);
        };
        if (params.broadcastId && broadcastParams) {
            return videoEditStreaming(mapBroadcastFormData(broadcastParams, params))
                .then(editCall)
                .catch(handleError);
        }
        else {
            return editCall();
        }
    }, [call, postEditCall.fetchData]);
    /** удаление звонка */
    const fetchDeleteCall = useCallback(() => {
        if (!call) {
            return;
        }
        postDeleteCall
            .fetchData({
            call_id: call.call_id,
        })
            .then(closePopup)
            .catch(handleError);
    }, [call, postDeleteCall.fetchData]);
    // разворачиваем, если никакой звонок не выбран
    if (!call) {
        handlePromiseError('Пытаемся показать окно редактирования без выбранного звонка');
        return _jsx(_Fragment, {});
    }
    return (_jsxs(_Fragment, { children: [popup === EHistoryScreenPopup.EditCalendarEvent && (_jsx(ModalScheduleCall, { onClose: closePopup, headerTitle: langs.getLang('calls_edit_call_title'), onSubmit: fetchEditCall, call: call, loading: postEditCall.loading, myUserId: meParticipant?.id, userSelectOptions: userSelectOptions, isSferum: config.sferum, toggles: config })), popup === EHistoryScreenPopup.DeleteCalendarEvent && (_jsx(ModalDeleteCall, { call: call, onClose: closePopup, onSubmit: fetchDeleteCall, onReschedule: handleRescheduleCall, loading: postDeleteCall.loading })), popup === EHistoryScreenPopup.RescheduleCalendarEvent && (_jsx(ModalRescheduleCall, { call: call, onClose: closePopup, onSubmit: fetchEditCall, loading: postEditCall.loading, myUserId: meParticipant?.id, userSelectOptions: userSelectOptions, isSferum: config.sferum, toggles: config }))] }));
};
//# sourceMappingURL=ModalEditCalendarEventContainer.js.map