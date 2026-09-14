import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Separator, Spacing, SpacedList, Placeholder, Div } from '@vkontakte-internal/vkcom-kit';
import { getIsHandRaised, getIsHelpRequested } from '../../../../../../helpers/participant';
import { isCreator, participantIsAdmin, externalIdToString, } from '@vkontakte-internal/calls-core';
import { useLang } from '../../../../../../hooks/useLang';
import { ParticipantsListItem, } from '../ParticipantsListItem/ParticipantsListItem';
import { getUserName } from '../../../../../../helpers/user';
export const ParticipantsList = ({ header, devices, selectable, checked, participants, showIfEmpty, showSeparator, ...restProps }) => {
    const { getLang } = useLang();
    return (_jsxs(_Fragment, { children: [showSeparator && (_jsx(Spacing, { size: 10, children: _jsx(Separator, {}) })), header, _jsxs(Div, { mode: "vertical", spacing: 8, paddingTop: 4, paddingBottom: 4, children: [devices && devices.length ? (_jsx(SpacedList, { spacing: 6, children: devices.map((device) => {
                            const key = externalIdToString(device.externalId);
                            const participant = participants[device.externalId.id];
                            const isParticipantAdmin = participantIsAdmin(participant);
                            const isParticipantCreator = isCreator(participant);
                            const participantDisplayName = getUserName(participant);
                            return (participant && (_jsx(ParticipantsListItem, { isAdmin: isParticipantAdmin, isCreator: isParticipantCreator, isHandRaised: getIsHandRaised(device), isHelpRequested: getIsHelpRequested(device), participantNft: participant.is_nft, participantPeerId: participant.peerId, participantPhoto: participant.photo, participantName: participant.name, participantDisplayName: participantDisplayName, deviceExternalId: device.externalId, isAudioEnabled: device.mediaSettings.isAudioEnabled, isVideoEnabled: device.mediaSettings.isVideoEnabled, isScreenSharingEnabled: device.mediaSettings.isScreenSharingEnabled, selectable: selectable, checked: checked, ...restProps }, key)));
                        }) })) : null, !devices?.length && showIfEmpty && (_jsx(Placeholder, { children: getLang('calls_room_control_participants_empty') }))] })] }));
};
//# sourceMappingURL=ParticipantsList.js.map