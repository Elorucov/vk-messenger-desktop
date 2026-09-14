import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"SimpleCell":["@vkontakte-internal/vkcom-kit",{"className":1}],"div":["global",{"className":1}]} */
import { modalHasType, ModalType, isSameExternalId, getUserName, peerIdToVkId, vou, useNavigationContext, useVkmeContext, } from '@vkontakte-internal/calls-core';
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { useState, useEffect } from 'react';
import { getIsHandRaised, getSingleLetter } from '../../../../helpers/participant';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import { ParticipantStatus } from '@vkontakte/calls-sdk';
import ListItem from '../../../../palette/ListItem/ListItem';
import { ParticipantIndicators } from '../../../../components/ParticipantIndicators/ParticipantIndicators';
import { ParticipantItemRightSide } from '../../../../components/ParticipantItemRightSide';
import { ParticipantMenuWidget } from '../../../../components/ParticipantMenu';
import Entity from '../../../../palette/Entity/Entity';
import { CallPhoto } from '../../../../components/CallPhoto/CallPhoto';
import { CallPhotoBadge } from '../../../../components/CallPhoto/CallPhotoBadge';
import { getIdForColorCalculation } from '../../../../helpers/user';
import { Link, RichAvatar, Separator, SimpleCell, Skeleton, calcInitialsAvatarColor, } from '@vkontakte-internal/vkcom-kit';
import { toggleModal } from '../../../../actions';
import { useLang } from '../../../../hooks/useLang';
import { useTypedDispatch } from '../../../../hooks/useTypedDispatch';
import { getModal, getMyExternalId, getTranslationStartTime } from '../../../../selectors';
import styles from './CallParticipantListRow.module.css';
import { Provider, useModel } from './CallParticipantListRowModel';
const CallParticipantListRow = observer(function CallParticipantListRow() {
    const { hasNewViewOfMuteActions, muteController, props } = useModel();
    const { isMicrophoneAllowed, isMicrophoneCurrentlyOn, muteMicrophone, isCameraAllowed, isCameraCurrentlyOn, muteCamera, } = muteController;
    const { device, canMute, onClickHandRaised, onUnmuteDevice, deviceId, withDivider, isSpeaking } = props;
    const { navigateToProfile } = useNavigationContext();
    const dispatch = useTypedDispatch();
    const { isVkme } = useVkmeContext();
    const modal = useTypedSelector(getModal);
    const participant = useTypedSelector((state) => state.participants[device.externalId.id]);
    const externalId = useTypedSelector(getMyExternalId);
    const translationStartTime = useTypedSelector(getTranslationStartTime);
    const { getLang } = useLang();
    const isMe = isSameExternalId(device.externalId, externalId);
    const isConnecting = !isMe && device.status === ParticipantStatus.WAITING;
    const isParticipantAdmin = Boolean(device.isAdmin);
    const isParticipantCreator = Boolean(device.isCreator);
    const hasAdminRights = isParticipantAdmin || isParticipantCreator;
    const isMicrophoneDisabled = !isConnecting && !isMicrophoneCurrentlyOn;
    const isMicrophonePermanentDisabled = !hasAdminRights && !isMicrophoneAllowed;
    const isCameraDisabled = !isConnecting && !isCameraCurrentlyOn;
    const isCameraPermanentDisabled = !hasAdminRights && !isCameraAllowed;
    const hasLiveTranslation = !isConnecting && device.hasLiveTranslation;
    const [isLiveTranslationStarted, setIsLiveTranslationStarted] = useState(false);
    const isPinned = !isConnecting && device.isPinned;
    const isRaisedHand = !isConnecting && getIsHandRaised(device);
    const isScreenShared = !isConnecting && device.isScreenShared;
    const isWithIndicators = isConnecting || isMicrophoneDisabled || isRaisedHand || isSpeaking;
    const showRaisedHandTooltip = !isConnecting && (isMicrophoneDisabled || isCameraDisabled) && canMute && !isMe;
    const name = getUserName(participant);
    const roleDescription = isParticipantCreator
        ? getLang('calls_participant_list_creator')
        : isParticipantAdmin
            ? getLang('calls_participant_list_admin')
            : '';
    const onLinkClick = (e, link) => {
        navigateToProfile(e, link, peerIdToVkId(participant.peerId));
        if (isVkme && modalHasType(modal, ModalType.MANAGEMENT)) {
            dispatch(toggleModal());
        }
    };
    const getTitle = () => {
        let result = (_jsx("span", { "data-testid": "calls_participant_list_item_name", children: name || _jsx(Skeleton, { width: 100, height: 15 }) }));
        if (hasNewViewOfMuteActions && participant?.link) {
            result = (_jsx(Link, { href: participant?.link, onClick: onLinkClick, target: "_blank", children: result }));
        }
        return result;
    };
    const handleClickHandRaised = showRaisedHandTooltip
        ? () => (hasNewViewOfMuteActions ? onClickHandRaised(device) : onUnmuteDevice(device))
        : undefined;
    useEffect(() => {
        const now = Date.now();
        setIsLiveTranslationStarted(hasLiveTranslation && (!translationStartTime || now >= translationStartTime));
        if (hasLiveTranslation && translationStartTime && now < translationStartTime) {
            const clearId = setTimeout(() => setIsLiveTranslationStarted(true), translationStartTime - now);
            return function cleanUp() {
                clearTimeout(clearId);
            };
        }
    }, [hasLiveTranslation, translationStartTime]);
    if (hasNewViewOfMuteActions) {
        return (_jsxs(_Fragment, { children: [_jsx(SimpleCell, { after: _jsx(ParticipantItemRightSide, { device: device, hasLiveTranslation: hasLiveTranslation, isCameraDisabled: isCameraDisabled, isCameraPermanentDisabled: isCameraPermanentDisabled, isConnecting: isConnecting, isHandRaised: isRaisedHand, isHandRaisedTooltipEnabled: showRaisedHandTooltip, isLiveTranslationStarted: isLiveTranslationStarted, isMe: isMe, isMicrophoneDisabled: isMicrophoneDisabled, isMicrophonePermanentDisabled: isMicrophonePermanentDisabled, isPinned: isPinned, isScreenShared: isScreenShared, isSpeaking: isSpeaking, onClickHandRaised: handleClickHandRaised, onMuteCamera: canMute && !isCameraDisabled && !isMe ? muteCamera : undefined, onMuteMicrophone: canMute && !isMicrophoneDisabled && !isMe ? muteMicrophone : undefined }), before: 
                    // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/check-required-props-usage
                    _jsx(RichAvatar, { "data-testid": "calls_call_photo", gradientColor: !participant.is_nft
                            ? calcInitialsAvatarColor(getIdForColorCalculation(participant.peerId))
                            : undefined, initials: getSingleLetter(name), nft: participant.is_nft, noBorder: true, size: participant.is_nft ? 36 : 40, src: participant.photo, children: hasAdminRights && _jsx(CallPhotoBadge, { type: isParticipantCreator ? 'creator' : 'admin' }) }), className: styles.item, "data-testid": "calls_participant_list_item", hasActive: false, hasHover: false, subtitle: roleDescription, children: getTitle() }), withDivider && _jsx(Separator, {})] }));
    }
    return (_jsx(ListItem, { selectable: false, border: false, "data-testid": "calls_participant_list_item", className: vou(withDivider, 'CallParticipantListItem_divider'), aside: _jsxs("div", { className: styles.aside, children: [isWithIndicators && (_jsx(ParticipantIndicators, { showSpeaking: isSpeaking, showRaisedHand: isRaisedHand, showAudioDisabled: isMicrophoneDisabled, showConnecting: isConnecting, showRaisedHandTooltip: showRaisedHandTooltip, onRaisedHandClick: handleClickHandRaised }, "indicators")), _jsx(ParticipantMenuWidget, { externalId: device.externalId })] }), children: _jsx(Entity, { className: "CallParticipantList__Entity", onLinkClick: onLinkClick, photo: _jsx(CallPhoto, { peerId: participant.peerId, photo: participant.photo, alt: name, letter: getSingleLetter(name), showCreatorBadge: isParticipantCreator, showAdminBadge: isParticipantAdmin, isNFT: participant.is_nft, size: participant.is_nft ? 36 : 40 }), title: getTitle(), description: roleDescription, href: participant?.link, target: "_blank", ignoreDecodeHTML: true }) }, deviceId));
});
export const CallParticipantListRowWidget = createWidget(Provider, CallParticipantListRow);
//# sourceMappingURL=CallParticipantListRow.js.map