import { Mode, } from '@vkontakte-internal/calls-core';
import { getMediaModifiers } from '../../helpers/call';
import { E_ACTION } from '../../constants';
import { convertServerData } from '../../helpers/helpers';
import { retryLoadCallPeers } from '../backend';
import { ParticipantStatus } from '@vkontakte/calls-sdk';
import { setConversationData } from '../../actions/actions';
import { updateClientDenoiser } from '../effectVoiceChange';
export const createMediaModifiersUpdater = ({ SDK, dispatch, getClientNoiseReductionModeEnabled, getNoiseReductionModeEnabled, getEffectVoiceChange, getIsRestrictedConversation, getLocalDevice, getNoiseCancellationType, getNoiseReductionMode, }) => () => {
    const localDevice = getLocalDevice();
    const restrictedConversation = getIsRestrictedConversation();
    if (localDevice.status === ParticipantStatus.WAITING_HALL || restrictedConversation) {
        return;
    }
    const { noiseCancellationModesByType } = getMediaModifiers({
        noiseReductionMode: getNoiseReductionMode(),
        enableNoiseReductionMode: getNoiseReductionModeEnabled(),
    });
    const noiseCancellationType = getNoiseCancellationType();
    SDK.setMediaModifiers(noiseCancellationModesByType[noiseCancellationType]);
    updateClientDenoiser(getClientNoiseReductionModeEnabled(), noiseCancellationType, noiseCancellationModesByType, getEffectVoiceChange(), dispatch);
};
export function loadConversationDataPostProcess(dispatch, peerId, conversationData) {
    const hasPreloadedData = !!conversationData;
    if (!hasPreloadedData || !peerId) {
        return Promise.resolve();
    }
    return retryLoadCallPeers(peerId).then((data) => {
        const [conversation, members] = convertServerData(data);
        setConversationData(dispatch, { conversation, members, originalConversation: data.items[0] });
    });
}
export const blockAllBridgeMethods = (bridge, dispatch) => {
    const blockCall = () => {
        dispatch({
            type: E_ACTION.CHANGE_MODE,
            mode: Mode.START,
        });
    };
    const blockJoin = (params) => {
        dispatch({
            type: E_ACTION.CHANGE_MODE,
            mode: Mode.START,
            joinLink: params.joinLink,
        });
        return Promise.resolve();
    };
    // @ts-expect-error TS2322: Type '() => void' is not assignable to type 'Call'
    bridge.call = blockCall;
    // @ts-expect-error TS2322: Type '() => void' is not assignable to type 'StartGroupCall'
    bridge.startGroupCall = blockCall;
    // @ts-expect-error TS2322: Type '() => void' is not assignable to type 'StartCall'
    bridge.startCall = blockCall;
    // @ts-expect-error TS2322: Type '() => void' is not assignable to type 'AcceptCallMethod'
    bridge.acceptCall = blockCall;
    bridge.joinCallByLink = blockJoin;
    // @ts-expect-error TS2322: Type '() => void' is not assignable to type 'ShowJoinPopup'
    bridge.showJoinPopup = blockCall;
    // @ts-expect-error TS2322: Type '() => void' is not assignable to type 'ShowCallByNamePopup'
    bridge.showCallByNamePopup = blockCall;
    // @ts-expect-error TS2322: Type '() => void' is not assignable to type 'ShowCreateCallByLink'
    bridge.showCreateCallByLinkPopup = blockCall;
    // @ts-expect-error TS2322: Type '() => void' is not assignable to type 'ShowShareQrCode'
    bridge.showShareQrCodePopup = blockCall;
    // @ts-expect-error TS2322: Type '() => void' is not assignable to type 'IPlanCalendarEventPopup'
    bridge.showPlanCalendarEventPopup = blockCall;
};
//# sourceMappingURL=utils.js.map