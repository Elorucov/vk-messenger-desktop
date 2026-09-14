import { jsx as _jsx } from "react/jsx-runtime";
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { PinnedParticipant } from '../PinnedParticipant/PinnedParticipant';
import { getStream } from '../../../helpers/participant';
import { isSameExternalId, externalIdToString } from '@vkontakte-internal/calls-core';
import { getCallTopology, getMyExternalId } from '../../../selectors';
import { useSpeakerDropdownActions } from '../hooks';
import { getVoiceRoomParticipantName } from '../helpers';
import { createWidget } from '@vkontakte-internal/di';
import { Provider, useModel } from './PinnedParticipantModel';
function PinnedParticipantView() {
    const { pinnedUser, setPinnedParticipant } = useModel();
    const { externalId, participant, device } = pinnedUser;
    const myExternalId = useTypedSelector(getMyExternalId);
    const topology = useTypedSelector(getCallTopology);
    const getActions = useSpeakerDropdownActions({
        setPinnedParticipant,
    });
    if (!device || !participant || !externalId) {
        return null;
    }
    const actions = getActions(device.externalId);
    const { mediaSettings } = device;
    const { isVideoEnabled, isAnimojiEnabled, isAudioEnabled } = mediaSettings;
    const isStreamEnabled = !!(isVideoEnabled || isAnimojiEnabled);
    const isMe = isSameExternalId(externalId, myExternalId);
    const stream = getStream(device, {
        animojiBackendRender: !isMe && topology === "SERVER" /* TransportTopology.SERVER */,
        useCameraOrAnimoji: true,
    });
    return (_jsx(PinnedParticipant, { isMe: isMe, stream: stream?.data, isAudioEnabled: isAudioEnabled, isVideoEnabled: isStreamEnabled, participantId: externalIdToString(externalId), userName: getVoiceRoomParticipantName(participant), photo: participant.photo, actions: actions }));
}
export const PinnedParticipantWidget = createWidget(Provider, PinnedParticipantView);
//# sourceMappingURL=PinnedParticipantWidget.js.map