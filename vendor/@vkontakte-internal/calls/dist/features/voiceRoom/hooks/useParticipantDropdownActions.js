import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Icon20UserMicrophoneBadgeSlashOutline":["@vkontakte/icons",{"width":1,"height":1}],"Icon16Chevron":["@vkontakte/icons",{"className":1}]} */
import { useTypedDispatch } from '../../../hooks/useTypedDispatch';
import { grantRoles, MediaOption, muteParticipant, UserRole, } from '@vkontakte/calls-sdk';
import { Icon16Chevron, Icon20AdvertisingOutline, Icon20Cancel, Icon20UserMicrophoneBadgeOutline, Icon20UserMicrophoneBadgeSlashOutline, Icon20UserStarOutline, Icon20VideocamOutline, Icon20ViewOutline, Icon20VoiceOutline, } from '@vkontakte/icons';
import { Avatar, DropdownActionSheet, SeparatorSpacing } from '@vkontakte-internal/vkcom-kit';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { isParticipantAnonym as checkIsParticipantAnonym } from '../../../helpers/participant';
import { useKickListener, useKickParticipant, useManagePromotions } from './useUserActions';
import { changeParticipantRoles, toggleModal } from '../../../actions';
import { useLang } from '../../../hooks/useLang';
import { getMeGroup, getMyDevice, getMyExternalId, getParticipants } from '../../../selectors';
import { handlePromiseError } from '../../../helpers/logger';
import { ModalType, MuteParticipantMode, participantIsAdmin, isCreator, isSameExternalId, getDefaultExternalId, getUserName, peerIdToVkId, vkIdToPeerId, mergeGroupToParticipant, useNavigationContext, } from '@vkontakte-internal/calls-core';
import { getIsVoiceRoomTribuneMode, getVoiceRoomScreenShareOwner } from '../selectors';
import { useConfig } from '../../../services/config';
export const useSpeakerDropdownActions = ({ setPinnedParticipant, pinnedParticipant = null, }) => {
    const { getLang } = useLang();
    const dispatch = useTypedDispatch();
    const { enableCallFeaturesInSpaces } = useConfig();
    const { handleDemote } = useManagePromotions();
    const handleKickParticipant = useKickParticipant();
    const screenShareOwner = useTypedSelector(getVoiceRoomScreenShareOwner);
    // todo - реализовать если вернемся к разработке voiceRooms
    const watchTogetherOwner = null;
    const participants = useTypedSelector(getParticipants);
    const localDevice = useTypedSelector(getMyDevice);
    const meGroup = useTypedSelector(getMeGroup);
    const localExternalId = useTypedSelector(getMyExternalId);
    const isTribune = useTypedSelector(getIsVoiceRoomTribuneMode);
    const isMeAdmin = participantIsAdmin(localDevice);
    const getActions = (externalId) => {
        const isMe = isSameExternalId(externalId, localExternalId);
        const _participant = participants[externalId.id];
        const participant = isMe && meGroup ? mergeGroupToParticipant(meGroup, _participant) : _participant;
        const isParticipantCreator = isCreator(participant);
        const isParticipantAdmin = participantIsAdmin(participant) || (isMe && isMeAdmin);
        const isPinned = isSameExternalId(pinnedParticipant, externalId);
        const isParticipantAnonym = checkIsParticipantAnonym(externalId.id);
        const isCanManaged = !isMe && isMeAdmin && !isParticipantCreator;
        const handleKick = () => handleKickParticipant(participant);
        const handleAssignAdmin = () => dispatch(toggleModal(ModalType.ADMIN_ASSIGNMENT, { peerId: participant.peerId }));
        const handleReAssignAdmin = () => {
            return grantRoles(externalId, [UserRole.ADMIN], true).then(() => {
                dispatch(changeParticipantRoles(participant.peerId, (participant.roles || []).filter((role) => role !== UserRole.ADMIN)));
            });
        };
        const handleDemoteSpeaker = async () => {
            try {
                if (isParticipantAdmin) {
                    await handleReAssignAdmin();
                }
                await handleDemote(externalId);
            }
            catch (e) {
                handlePromiseError(e);
            }
        };
        const handleMute = (mode) => {
            dispatch(toggleModal(ModalType.MUTE_PARTICIPANT, {
                externalId: externalId,
                mode,
            }));
        };
        const isShownPinAction = !screenShareOwner && !watchTogetherOwner;
        const isShownAssignAdminAction = isTribune && isCanManaged && !isParticipantAdmin && !isParticipantAnonym;
        const isShownReAssignAdminAction = isTribune && isCanManaged && isParticipantAdmin;
        const isShownDemoteAction = isTribune && isCanManaged;
        const isShownKickAction = isCanManaged;
        const isShownSeparator = isShownPinAction ||
            isShownAssignAdminAction ||
            isShownReAssignAdminAction ||
            isShownDemoteAction ||
            isShownKickAction;
        return (_jsxs(_Fragment, { children: [_jsx(ParticipantLinkAction, { isAnonym: isParticipantAnonym, participant: participant, subtitle: isParticipantAdmin
                        ? getLang('voicerooms_user_action_link_subtitle_admin')
                        : getLang('voicerooms_user_action_link_subtitle_speaker') }), isShownSeparator && _jsx(SeparatorSpacing, {}), isShownPinAction && (_jsx(PinAction, { externalId: isPinned ? null : externalId, setPinnedParticipant: setPinnedParticipant })), isShownAssignAdminAction && (_jsx(DropdownActionSheet.Item, { before: _jsx(Icon20UserStarOutline, {}), onClick: handleAssignAdmin, children: getLang('voicerooms_user_action_move_to_admin') })), isShownReAssignAdminAction && (_jsx(DropdownActionSheet.Item, { before: _jsx(Icon20UserStarOutline, {}), onClick: handleReAssignAdmin, children: getLang('voicerooms_user_action_kick_admin') })), isShownDemoteAction && (_jsx(DropdownActionSheet.Item, { before: _jsx(Icon20UserMicrophoneBadgeSlashOutline, { width: 20, height: 20 }), onClick: handleDemoteSpeaker, children: getLang('voicerooms_user_action_move_to_listeners') })), enableCallFeaturesInSpaces && isCanManaged && (_jsxs(_Fragment, { children: [_jsx(DropdownActionSheet.Item, { before: _jsx(Icon20AdvertisingOutline, {}), onClick: () => {
                                muteParticipant({
                                    externalId,
                                    muteStates: {},
                                    requestedMedia: [MediaOption.AUDIO, MediaOption.VIDEO],
                                }).catch(handlePromiseError);
                            }, children: getLang('voicerooms_user_action_request_media') }), _jsx(DropdownActionSheet.Item, { before: _jsx(Icon20VoiceOutline, {}), onClick: () => {
                                handleMute(MuteParticipantMode.SINGLE_AUDIO);
                            }, children: getLang('voicerooms_user_action_mute_micro') }), _jsx(DropdownActionSheet.Item, { before: _jsx(Icon20VideocamOutline, {}), onClick: () => {
                                handleMute(MuteParticipantMode.SINGLE_VIDEO);
                            }, children: getLang('voicerooms_user_action_mute_camera') })] })), isShownKickAction && (_jsx(DropdownActionSheet.Item, { type: "destructive", before: _jsx(Icon20Cancel, {}), onClick: handleKick, children: getLang('voicerooms_user_action_kick') }))] }));
    };
    return getActions;
};
export const useListenerDropdownActions = () => {
    const { getLang } = useLang();
    const { handlePromote } = useManagePromotions();
    const handleKickListener = useKickListener();
    const localDevice = useTypedSelector(getMyDevice);
    const isMeAdmin = participantIsAdmin(localDevice);
    const getActions = (listener) => {
        const externalId = getDefaultExternalId(vkIdToPeerId(listener.id));
        const handleKick = () => handleKickListener(listener);
        const actions = [];
        if (listener.link) {
            actions.push(_jsx(ParticipantLinkAction, { participant: listener }, "link"));
        }
        if (isMeAdmin) {
            actions.push(_jsx(DropdownActionSheet.Item, { before: _jsx(Icon20UserMicrophoneBadgeOutline, {}), onClick: () => handlePromote(externalId), children: getLang('voicerooms_move_to_speakers') }, "promote"));
            actions.push(_jsx(KickAction, { onKick: handleKick }, "kick"));
        }
        // todo костыль, необходимо поправить пропсы со стороны vkcomkit в VoiceRoomParticipant
        return actions.length ? _jsx(_Fragment, { children: actions }) : undefined;
    };
    return getActions;
};
export const usePromotionRequestItemActions = () => {
    const handleKickParticipant = useKickParticipant();
    const localDevice = useTypedSelector(getMyDevice);
    const isMeAdmin = participantIsAdmin(localDevice);
    const getActions = (listener) => {
        const handleKick = () => handleKickParticipant(listener);
        const actions = [];
        if (isMeAdmin) {
            actions.push(_jsx(KickAction, { onKick: handleKick }, "kick"));
        }
        // todo костыль, необходимо поправить пропсы со стороны vkcomkit в VoiceRoomParticipant
        return actions.length ? _jsx(_Fragment, { children: actions }) : undefined;
    };
    return getActions;
};
function PinAction({ externalId, setPinnedParticipant }) {
    const { getLang } = useLang();
    const handlePinParticipant = () => {
        setPinnedParticipant(externalId);
    };
    return (_jsx(DropdownActionSheet.Item, { before: _jsx(Icon20ViewOutline, {}), onClick: handlePinParticipant, children: externalId
            ? getLang('voicerooms_user_action_show_big')
            : getLang('voicerooms_user_action_show_like_all') }));
}
function ParticipantLinkAction({ participant, subtitle, isAnonym }) {
    const { navigateToProfile } = useNavigationContext();
    return (_jsx(DropdownActionSheet.Item, { onClick: !isAnonym
            ? (event) => navigateToProfile(event, participant.link, peerIdToVkId(participant.peerId))
            : undefined, subtitle: subtitle, 
        // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/check-required-props-usage
        before: _jsx(Avatar, { src: participant.photo, size: 20 }), after: !isAnonym && _jsx(Icon16Chevron, { className: "CallsVoiceRoomDropdownActionSheetUser__icon--chevron" }), children: getUserName(participant) }));
}
function KickAction({ onKick }) {
    const { getLang } = useLang();
    return (_jsx(DropdownActionSheet.Item, { type: "destructive", before: _jsx(Icon20Cancel, {}), onClick: onKick, children: getLang('voicerooms_user_action_kick') }));
}
//# sourceMappingURL=useParticipantDropdownActions.js.map