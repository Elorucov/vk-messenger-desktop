import { jsx as _jsx } from "react/jsx-runtime";
import { ModalScheduleCall, mapBroadcastFormData, mapFormData, useHandleSuccessScheduleCall, } from '../components/ModalScheduleCall';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCloseModal } from '../hooks/useCloseModal';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { useLang } from '../hooks/useLang';
import { useTypedDispatch } from '../hooks/useTypedDispatch';
import { useIsMounted } from '@vkontakte-internal/react-utils';
import { callsStart, getGroupsForCall, videoEditStreaming } from '../services/backend';
import { ModalType, peerIdToVkId } from '@vkontakte-internal/calls-core';
import { usePromiseError } from '../hooks/usePromiseError';
import { handlePromiseError } from '../helpers/logger';
import { useCreateScheduleCallValidator } from '../hooks/useCreateScheduleCallValidator';
import { useConfig } from '../services/config';
import { toggleModal } from '../actions';
import { updateBroadcastId } from '@vkontakte-internal/calls-core';
export const ModalPlanCalendarEventContainer = () => {
    const onClose = useCloseModal();
    const { getLang } = useLang();
    const { ownerOptions, meParticipant } = useOwnerOptions();
    const { handleOnSubmit, loading } = useStartCall();
    const config = useConfig();
    return (_jsx(ModalScheduleCall, { headerTitle: getLang('calls_plan_event'), onClose: onClose, onSubmit: handleOnSubmit, userSelectOptions: ownerOptions, myUserId: peerIdToVkId(meParticipant.peerId), loading: loading, isSferum: config.sferum, toggles: config }));
};
/** отправляем выбранные пользователем данные на сервер */
function useStartCall() {
    const dispatch = useTypedDispatch();
    const validator = useCreateScheduleCallValidator();
    const [loading, setLoading] = useState(false);
    const { handleError } = usePromiseError();
    const isMounted = useIsMounted();
    const onClose = useCloseModal();
    const meParticipant = useTypedSelector((state) => state.participants[state.externalId?.id || state.me]);
    const { sferum: isSferum } = useConfig();
    const setPlannedCalendarEvent = (event) => {
        dispatch(toggleModal(ModalType.SHARE_PLANNED_CALL, { calendarEvent: event }));
    };
    const handleSuccessSchedulledCall = useHandleSuccessScheduleCall({
        me: meParticipant,
        isSferum,
    });
    /** портянка обработки сетевого вызова планирования звонка */
    const handleOnSubmit = useCallback((params, broadcastParams) => {
        if (!validator(params, broadcastParams)) {
            return;
        }
        setLoading(true);
        const createCall = (editStreamingResponse) => {
            params.broadcastId = updateBroadcastId(editStreamingResponse, params.broadcastId);
            return callsStart(mapFormData(params))
                .then((data) => {
                if (!isMounted()) {
                    return;
                }
                handleSuccessSchedulledCall({
                    params,
                    data,
                    closePopup: onClose,
                    setPlannedCalendarEvent,
                });
            })
                .catch(handleError)
                .finally(() => {
                if (isMounted()) {
                    setLoading(false);
                }
            });
        };
        if (params.broadcastId && broadcastParams) {
            return videoEditStreaming(mapBroadcastFormData(broadcastParams, params))
                .then(createCall)
                .catch(handleError)
                .finally(() => {
                if (isMounted()) {
                    setLoading(false);
                }
            });
        }
        else {
            return createCall();
        }
    }, []);
    return {
        handleOnSubmit,
        loading,
    };
}
/** получаем возможные опции выбора "от какого пользователя" планируем */
function useOwnerOptions() {
    /** от каких пользователей мы можем запланировать звонок */
    const [optionsWithUserDate, setOptionsWithUserDate] = useState();
    const meParticipant = useTypedSelector((state) => {
        return state.participants[state.externalId?.id || state.me];
    });
    const ownerOptions = useMemo(() => {
        const myVkId = peerIdToVkId(meParticipant.peerId);
        const myOption = {
            value: myVkId,
            label: meParticipant.name,
            profile: { ...meParticipant, id: myVkId },
        };
        return [myOption, ...(optionsWithUserDate || [])];
    }, [optionsWithUserDate, meParticipant]);
    useEffect(() => {
        getGroupsForCall()
            .then((response) => {
            if (response.count > 0) {
                const options = (response.items || []).map((item) => ({
                    value: -item.id,
                    label: item.name || '',
                    profile: item,
                }));
                setOptionsWithUserDate(options);
            }
        })
            .catch(handlePromiseError);
    }, []);
    return {
        ownerOptions,
        meParticipant,
    };
}
//# sourceMappingURL=ModalPlanCalendarEventContainer.js.map