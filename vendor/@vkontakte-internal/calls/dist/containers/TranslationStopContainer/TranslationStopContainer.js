import { jsx as _jsx } from "react/jsx-runtime";
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { TranslationStopModal } from '../../components/TranslationStopModal/TranslationStopModal';
import { handlePromiseError } from '../../helpers/logger';
import { useLang } from '../../hooks/useLang';
import { Button } from '@vkontakte-internal/vkcom-kit';
import { useCloseModal } from '../../hooks/useCloseModal';
import { isUndefined } from '@vkontakte/vkjs';
import { getIsRecord, getIsTranslationOn, getIsVoiceRoom, getTranslation } from '../../selectors';
import { RecordStopModal as VoiceRoomRecordStopModal } from '../../features/voiceRoom/RecordStopModal/RecordStopModal';
import { useSendStatsService, ClickHouseEventType } from '../../stats/clickHouse';
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { stopStream } from '@vkontakte/calls-sdk';
import { TranslationStopContainerProvider, useTranslationStopContainerModel } from './model';
const TranslationStopView = observer(function TranslationStopView() {
    const { roomId } = useTranslationStopContainerModel();
    const { getLang, isOn, isRecord, isVoiceRoom, closeModal } = useController();
    const { ownerId, videoId } = useTypedSelector(getTranslation);
    const sendStats = useSendStatsService();
    const onStopTranslation = () => {
        if (!isOn) {
            // запись может быть уже остановлена другим пользователем
            closeModal();
            return;
        }
        const statData = {};
        if (!isUndefined(ownerId)) {
            statData.owner_id = ownerId;
        }
        if (!isUndefined(videoId)) {
            statData.vid = videoId;
        }
        stopStream(roomId)
            .then(() => {
            closeModal();
            sendStats(isRecord ? ClickHouseEventType.CALL_RECORDING_STOPPED : ClickHouseEventType.CALL_STREAMING_STOPPED, statData);
        })
            .catch(handlePromiseError);
    };
    const actionButtons = [
        _jsx(Button, { "data-testid": `calls_${isRecord ? 'record' : 'translation'}_stop_button_cancel`, onClick: closeModal, size: "m", stretched: isVoiceRoom, mode: "secondary", children: getLang('calls_cancel') }, "cancel"),
        _jsx(Button, { "data-testid": `calls_${isRecord ? 'record' : 'translation'}_stop_button_stop`, size: "m", stretched: isVoiceRoom, mode: "primary", onClick: onStopTranslation, children: getLang('calls_translation_stop') }, "stop"),
    ];
    return isVoiceRoom ? (_jsx(VoiceRoomRecordStopModal, { actions: actionButtons, onClose: closeModal })) : (_jsx(TranslationStopModal, { actionButtons: actionButtons, isRecord: isRecord, onClose: closeModal }));
});
function useController() {
    const { getLang } = useLang();
    const isOn = useTypedSelector(getIsTranslationOn);
    const isRecord = useTypedSelector(getIsRecord);
    const isVoiceRoom = useTypedSelector(getIsVoiceRoom);
    const closeModal = useCloseModal();
    return {
        getLang,
        isOn,
        isRecord,
        isVoiceRoom,
        closeModal,
    };
}
export const TranslationStopWidget = createWidget(TranslationStopContainerProvider, TranslationStopView);
//# sourceMappingURL=TranslationStopContainer.js.map