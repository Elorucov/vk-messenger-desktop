import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback } from 'react';
import { TranslationCreateWidget, } from '../components/TranslationCreateForm';
import { E_ACTION } from '../constants';
import { ModalType, } from '@vkontakte-internal/calls-core';
import { useTypedDispatch } from '../hooks/useTypedDispatch';
import { CallManagementModal } from '../components/CallManagementModal/CallManagementModal';
import { CallManagementMenu } from '../components/CallManagementMenu/CallManagementMenu';
import { canStopTranslation } from '../helpers/translation';
import { useCallsSDK } from '../providers/CallsSdkProvider';
import { handlePromiseError } from '../helpers/logger';
import { useLang } from '../hooks/useLang';
import { Button } from '@vkontakte-internal/vkcom-kit';
import { toggleModal } from '../actions';
import { useCloseModal } from '../hooks/useCloseModal';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { ClickHouseEventType, useSendStatsService } from '../stats/clickHouse';
import { getIsTranslationOn, getIsVoiceRoom } from '../selectors';
export const TranslationContainer = ({ isRecord }) => {
    const SDK = useCallsSDK();
    const { canStopThisTranslation, isOn, translationLink } = useTypedSelector((state) => ({
        canStopThisTranslation: canStopTranslation(state),
        isOn: getIsTranslationOn(state),
        translationLink: state.translation.link,
    }));
    const isVoiceRoom = useTypedSelector(getIsVoiceRoom);
    const dispatch = useTypedDispatch();
    const { getLang } = useLang();
    const sendStats = useSendStatsService();
    const closeModal = useCloseModal();
    const handleStopTranslation = useCallback(() => {
        dispatch(toggleModal(ModalType.TRANSLATION_STOP));
    }, []);
    const handleSubmit = useCallback((streamParams) => {
        if (streamParams?.upcomingStreamParams) {
            const { startTime, ovId, id, ownerId, roomId } = streamParams.upcomingStreamParams;
            if (startTime && startTime > Date.now() / 1000 + 4) {
                const statData = {
                    vid: id,
                    owner_id: ownerId,
                    upcoming: 1,
                };
                return SDK.startStream(isRecord, null, ovId, undefined, undefined, roomId)
                    .then(() => {
                    sendStats(isRecord
                        ? ClickHouseEventType.CALL_RECORDING_STARTED
                        : ClickHouseEventType.CALL_STREAMING_STARTED, statData);
                })
                    .catch((err) => {
                    sendStats(isRecord
                        ? ClickHouseEventType.CALL_RECORDING_START_FAILED
                        : ClickHouseEventType.CALL_STREAMING_START_FAILED, statData);
                    handlePromiseError(err);
                })
                    .finally(closeModal);
            }
        }
        const translationData = {
            isOn: false,
            startStreamParams: streamParams,
            isRecord,
            name: streamParams.streamParams?.name,
        };
        if (isRecord && translationData.startStreamParams?.streamParams) {
            translationData.startStreamParams.streamParams.is_call_record = 1;
        }
        dispatch({
            type: E_ACTION.SET_TRANSLATION,
            data: translationData,
        });
        dispatch(toggleModal(ModalType.TRANSLATION_START_COUNTDOWN));
        return Promise.resolve();
    }, [isRecord]);
    const handleLinkBlockClick = useCallback(() => {
        dispatch(toggleModal(ModalType.TRANSLATION_SHARE));
    }, []);
    return isOn ? (_jsx(CallManagementModal, { title: getLang('calls_translation_menu_title'), dataTestId: "calls_translations_container_modal_root", actionButtons: canStopThisTranslation
            ? [
                _jsx(Button, { "data-testid": "calls_translation_stop", size: "m", onClick: handleStopTranslation, appearance: "negative", children: getLang('calls_translation_menu_stop') }, "stop"),
            ]
            : [], onCloseModal: closeModal, children: _jsx(CallManagementMenu, { isLinkBlockShown: true, linkBlockTitle: getLang('calls_translation_menu_link'), onLinkBlockClick: handleLinkBlockClick, callUrlLink: translationLink }) })) : (_jsx(TranslationCreateWidget, { onSubmit: handleSubmit, onClose: closeModal, isRecord: isRecord, isVoiceRoom: isVoiceRoom }));
};
//# sourceMappingURL=TranslationContainer.js.map