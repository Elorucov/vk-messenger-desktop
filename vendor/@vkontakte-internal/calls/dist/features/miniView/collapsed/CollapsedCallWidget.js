import { jsx as _jsx } from "react/jsx-runtime";
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect } from 'react';
import { useTypedDispatch } from '../../../hooks/useTypedDispatch';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { CollapsedCall, CollapsedCallDraggable } from './CollapsedCall/CollapsedCall';
import { CallWidget } from '../../../components/CallWidget/CallWidget';
import { CallVideoWidget } from './CallVideoWidget/CallVideoWidget';
import { E_ACTION } from '../../../constants';
import { CallsEventType, Mode, UIMode, isSameExternalId, isParticipantScreenSharingEnabled, useCallsBridge, } from '@vkontakte-internal/calls-core';
import { getStream } from '../../../helpers/participant';
import { useLang } from '../../../hooks/useLang';
import { FocusTrap } from '@vkontakte-internal/vkcom-kit';
import { isMiniAppSource } from '../../../helpers/apps';
import { CallMiniAppWidget } from './CallMiniAppWidget/CallMiniAppWidget';
import { getPeerId } from '../../../selectors';
import { ClickHouseEventType, useSendStatsService } from '../../../stats/clickHouse';
import { createWidget } from '@vkontakte-internal/di';
import { CollapsedCallModelProvider, useCollapsedCallModel } from './CollapsedCallModel';
const CollapsedCallView = observer(function CollapsedCallView() {
    const { isAudioAllowed, visibleParticipant, loadVmojiSvg, targetElement, visibleParticipantData, conversation, } = useCollapsedCallModel();
    const bridge = useCallsBridge();
    const dispatch = useTypedDispatch();
    const { getLang } = useLang();
    const sendStats = useSendStatsService();
    const peerId = useTypedSelector(getPeerId);
    const externalId = useTypedSelector((state) => state.externalId);
    const localDevice = useTypedSelector((state) => state.localDevice);
    const mode = useTypedSelector((state) => state.mode);
    const localVideoStreamData = getStream(localDevice, { useCameraOrAnimoji: true });
    const isMe = isSameExternalId(visibleParticipant.externalId, externalId);
    const isOverlayLocalVideoEnabled = Boolean(localVideoStreamData && visibleParticipant && !isMe);
    /** признак, что сейчас ведется запись звонка */
    const isRecord = useTypedSelector((state) => {
        return state.translation.isOn && !!state.translation.isRecord;
    });
    const isMiniApp = useTypedSelector((state) => isMiniAppSource(state.entryPoint?.source));
    useEffect(() => {
        loadVmojiSvg(!externalId || isMe ? [visibleParticipant.externalId] : [visibleParticipant.externalId, externalId]);
    }, [visibleParticipant.externalId, isMe, externalId]);
    const restoreCall = useCallback(() => {
        dispatch({
            type: E_ACTION.CHANGE_UI_MODE,
            mode: UIMode.DEFAULT,
        });
        bridge.eventBus.emit(CallsEventType.LAYOUT_NORMAL);
    }, []);
    const isAudioAvailable = localDevice?.mediaSettings?.isAudioEnabled || isAudioAllowed;
    const widgetProps = {
        localVideoStreamData: isOverlayLocalVideoEnabled ? localVideoStreamData : undefined,
        isLocalAudioEnabled: !!localDevice.mediaSettings?.isAudioEnabled,
        isLocalAudioAllowed: isAudioAvailable,
        isLocalScreenSharing: isParticipantScreenSharingEnabled(localDevice),
        isLocalVmoji: !!localDevice.mediaSettings?.isAnimojiEnabled,
        ...visibleParticipantData,
        isRecord: isRecord,
        localDeviceStatus: localDevice.networkStatus,
        targetElementId: targetElement,
    };
    useEffect(() => {
        sendStats(ClickHouseEventType.CALL_COLLAPSED, { event_param: 1 }, isMiniApp);
    }, [isMiniApp]);
    if (mode === Mode.INCOMING) {
        return (_jsx(CollapsedCall, { children: _jsx(FocusTrap, { hasFirstFocusableElement: true, children: _jsx(CallWidget, { id: peerId, title: conversation?.tab || '', photo: conversation?.photo || '', status: getLang('calls_incoming_collapsed'), isIncoming: true, onClick: restoreCall }) }) }));
    }
    if (isMiniApp) {
        return (_jsx(CollapsedCallDraggable, { className: "CollapsedCall--miniApp", children: _jsx(FocusTrap, { hasFirstFocusableElement: true, children: _jsx(CallMiniAppWidget, { ...widgetProps }) }) }));
    }
    return (_jsx(CollapsedCallDraggable, { children: _jsx(FocusTrap, { hasFirstFocusableElement: true, children: _jsx(CallVideoWidget, { ...widgetProps }) }) }));
});
export const CollapsedCallWidget = createWidget(CollapsedCallModelProvider, CollapsedCallView);
//# sourceMappingURL=CollapsedCallWidget.js.map