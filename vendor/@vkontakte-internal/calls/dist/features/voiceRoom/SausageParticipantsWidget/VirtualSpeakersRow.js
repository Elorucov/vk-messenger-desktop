import { jsx as _jsx } from "react/jsx-runtime";
import { Fragment } from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
import { VoiceRoomParticipantSkeleton } from '@vkontakte-internal/vkcom-kit';
import { getVoiceRoomParticipantName } from '../helpers';
import { useLang } from '../../../hooks/useLang';
import { isCreator, isAdmin, } from '@vkontakte-internal/calls-core';
import { generateVirtualItemKey, getVirtualItemIndex } from './helpers';
import { VirtualItemContainer } from './VirtualItemContainer';
import { vou } from '../../../helpers/helpers';
import { Speaker } from './Speaker';
export const VirtualSpeakersRow = ({ virtualColumnItems, virtualRow, rowsSpeakersOffset = 0, activeSpeakers, localDevice, participants, speakersCount, getActions, checkIsSpeaking, getStream, speakerSize, checkIsMe, countSpeakersInLine, isVirtualPosition = true, itemClassName, meGroup, }) => {
    const { getLang } = useLang();
    return (_jsx(Fragment, { children: virtualColumnItems.map((virtualColumn) => {
            const elemNumber = getVirtualItemIndex(virtualRow.index, virtualColumn.index, countSpeakersInLine, rowsSpeakersOffset);
            const device = activeSpeakers[elemNumber];
            const isMe = Boolean(device && checkIsMe(device.externalId));
            const participant = isMe && meGroup ? meGroup : participants[device?.externalId?.id];
            if (elemNumber + 1 > speakersCount) {
                return null;
            }
            const key = generateVirtualItemKey(virtualRow.index, virtualColumn.index, device?.externalId?.id);
            if (!device || !participant) {
                return (_jsx(VirtualItemContainer, { dataIndex: key, width: virtualColumn.size, height: virtualRow.size, offsetX: virtualColumn.start, offsetY: virtualRow.start, isVirtualPosition: isVirtualPosition, className: cx('CallsVoiceRoomCall__ParticipantWrapper', itemClassName), children: _jsx(VoiceRoomParticipantSkeleton, { size: speakerSize, cellSize: "dynamic" }) }, key));
            }
            const actions = getActions(device.externalId);
            const displayedName = isMe ? getLang('calls_own_label') : getVoiceRoomParticipantName(participant);
            const isSpeaking = checkIsSpeaking(device.externalId);
            const stream = getStream(device);
            // todo забрать из кита
            const getUserRole = () => {
                if (isCreator(isMe ? localDevice : participant)) {
                    return 'creator';
                }
                if (isAdmin(isMe ? localDevice : participant)) {
                    return 'admin';
                }
            };
            return (_jsx(VirtualItemContainer, { dataIndex: key, width: virtualColumn.size, height: virtualRow.size, offsetX: virtualColumn.start, offsetY: virtualRow.start, isVirtualPosition: isVirtualPosition, className: cx('CallsVoiceRoomCall__ParticipantWrapper', itemClassName), children: _jsx(Speaker, { externalId: device.externalId, cellSize: "l", isMe: isMe, mirrored: isMe, speaking: isSpeaking, role: getUserRole(), size: speakerSize, src: participant?.photo, userName: displayedName, videoId: device.externalId.id, stream: stream?.data || null, hasVideo: !!stream, actions: actions, hasMicrophoneDisabledled: !device.mediaSettings.isAudioEnabled, gradientColor: vou(!participant?.photo && !stream?.data, 'blue') }) }, key));
        }) }, virtualRow.key));
};
//# sourceMappingURL=VirtualSpeakersRow.js.map