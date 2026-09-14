import { jsx as _jsx } from "react/jsx-runtime";
import { externalIdToString, isSameExternalId, } from '@vkontakte-internal/calls-core';
import { getUserName } from '../../helpers/user';
import { ParticipantLite } from '../../components/ParticipantLite/ParticipantLite';
import { getSingleLetter } from '../../helpers/participant';
import { ParticipantStatus } from '@vkontakte/calls-sdk';
import { ParticipantAppearance, ParticipantWithIndicatorWidget } from '../../components/Participant';
import { observer } from 'mobx-react-lite';
import { useLang } from '../../hooks/useLang';
export const ActiveParticipantsList = observer(function ActiveParticipantsList({ participantsList, isOratorViewShown, startBoundaryIndex, myExternalId, participants, pinnedParticipant, mediaSharingPinnedParticipant, watchTogetherPinnedParticipant, adminPinnedParticipant, devicesVisibleCount, firstVisibleDevice, onPinParticipant, onPinParticipantForce, oratorExternalId, mode, }) {
    const { getLang } = useLang();
    return participantsList.map((device, listIndex) => {
        const isMe = isSameExternalId(device.externalId, myExternalId);
        const participant = participants[device.externalId.id];
        const deviceId = externalIdToString(device.externalId);
        const name = getUserName(participant);
        const displayedName = isMe ? getLang('calls_own_label') : name;
        const isPinnedByMe = isSameExternalId(pinnedParticipant, device.externalId);
        const isPinned = isOratorViewShown &&
            (isPinnedByMe ||
                isSameExternalId(mediaSharingPinnedParticipant, device.externalId) ||
                isSameExternalId(watchTogetherPinnedParticipant, device.externalId));
        const isPinnedByAdmin = isOratorViewShown && isSameExternalId(adminPinnedParticipant, device.externalId);
        const index = listIndex + startBoundaryIndex;
        const endIndex = firstVisibleDevice + devicesVisibleCount;
        const visible = index >= firstVisibleDevice && index < endIndex;
        if (!visible) {
            return (_jsx(ItemWrapper, { mode: mode, children: _jsx(ParticipantLite, { externalId: device.externalId, gender: participant?.sex, isInfoShown: true, isMe: isMe, photo: participant?.photo, name: displayedName, letter: getSingleLetter(name), onClickParticipant: onPinParticipant, isPinned: isPinned, isPinnedByAdmin: isPinnedByAdmin }) }, deviceId));
        }
        const isOrator = isOratorViewShown && isSameExternalId(oratorExternalId, device.externalId);
        const status = device.status || ParticipantStatus.CONNECTED;
        return (_jsx(ItemWrapper, { mode: mode, children: _jsx(ParticipantWithIndicatorWidget, { appearance: isOratorViewShown ? ParticipantAppearance.SAUSAGE : ParticipantAppearance.GRID, externalId: device.externalId, isInfoShown: true, isMe: isMe, isOrator: isOrator, photo: participant?.photo, name: displayedName, gender: participant?.sex, letter: getSingleLetter(name), status: status, onClickParticipant: isOratorViewShown ? onPinParticipant : undefined, onDblClickParticipant: isOratorViewShown ? undefined : onPinParticipantForce, isPinned: isPinned, isPinnedByAdmin: isPinnedByAdmin, photoSize: 64 }) }, deviceId));
    });
});
function ItemWrapper({ children, mode }) {
    switch (mode) {
        case 'grid': {
            return (_jsx("article", { className: "CallGridNew__item", "data-testid": "calls_grid_view_participant", "data-calls-id": "grid-item", children: children }));
        }
        case 'orator': {
            return (_jsx("li", { className: "CallOrator__participant", "data-testid": "calls_sausage_participant", "data-calls-id": "participant", children: children }));
        }
        default: {
            return children;
        }
    }
}
//# sourceMappingURL=ActiveParticipantsList.js.map