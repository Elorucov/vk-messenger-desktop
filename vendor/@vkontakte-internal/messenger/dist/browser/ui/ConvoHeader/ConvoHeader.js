import '../../ui/ConvoHeader/ConvoHeader.css';
import React, { forwardRef, useState } from 'react';
import { useBrowserEnv, useCommunityMessagingWithToggle, useDispatch, useFeatureFlags, useHelpHints, useOwner, useViewer, useTypings, } from '../../hooks/misc';
import * as Convo from '../../../core/model/Convo';
import * as Peer from '../../../core/model/Peer';
import * as Viewer from '../../../core/model/Viewer';
import { Avatar } from '../../ui/Avatar/Avatar';
import { ConvoTitle } from '../../ui/ConvoTitle/ConvoTitle';
import { AvatarFavorites } from '../../ui/AvatarFavorites/AvatarFavorites';
import { OnlineStatus } from '../../ui/OnlineStatus/OnlineStatus';
import { Icon12ErrorCircleFill, Icon24Cancel, Icon24ChevronCompactLeft, Icon24MoreHorizontal, Icon24PhoneOutline, Icon24SearchOutline, Icon28HistoryForwardOutline, } from '@vkontakte/icons';
import { Counter, Subhead } from '@vkontakte/vkui';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { CallMenu } from '../../ui/CallMenu/CallMenu';
import cx from 'classnames';
import { MarusiaAddToGroupChatButton } from '../../ui/MarusiaAddToGroupChatButton/MarusiaAddToGroupChatButton';
import { useRouter } from '../../ui/Router/Router';
import { Link } from '../../ui/Link/Link';
import { EmployeeVacationMark } from '../../ui/EmployeeVacationMark/EmployeeVacationMark';
import { OnboardingTooltip } from '../../ui/OnboardingTooltip/OnboardingTooltip';
import { OnboardingMarkedTooltip } from '@vkontakte-internal/vkcom-kit';
import { OnboardingWrapper } from '../../ui/OnboardingWrapper/OnboardingWrapper';
import { DeferredRendering } from '../../ui/DeferredRendering/DeferredRendering';
import { useOnlineMembersCount } from '../../hooks/useOnlineMembersCount';
export const ConvoHeader = ({ peer, convo, onSearchClick, actionsMenu, availableOnboardingTooltips, closeConvo, onPostponedClick, }) => {
    const { lang, calls, envFeatureFlags } = useBrowserEnv();
    const featureFlags = useFeatureFlags();
    const viewer = useViewer();
    const owner = useOwner();
    const dispatch = useDispatch();
    const { navigate, screenRoute, rightPanel } = useRouter();
    const helpHints = useHelpHints();
    const typing = useTypings(peer.id, 'full', 0);
    const convoPostponedPermissions = Convo.postponedMessagingPermissions(convo);
    const isPostponedMessagesAvailable = envFeatureFlags.isPostponedMessagesAvailable &&
        convoPostponedPermissions.isHistoryAvailable;
    const isCommunityMessaging = useCommunityMessagingWithToggle();
    const onlineMembersCount = useOnlineMembersCount(convo.peerId);
    const isEdu = Viewer.isEdu(viewer.profileType);
    const isFavorites = owner.kind !== 'Group' && Peer.isFavorites(peer.id, owner.id);
    const isBackButtonAvailable = screenRoute.kind === 'ConvoRoute' && screenRoute.parentRoute;
    const [goBackButton, setGoBackButton] = useState(null);
    const handleBack = () => {
        if (screenRoute.kind === 'ConvoRoute' && screenRoute.parentRoute) {
            navigate(screenRoute.parentRoute);
            return;
        }
        navigate({ kind: 'MainRoute' });
    };
    const isSubheadHidden = peer.kind === 'User' &&
        peer.isDeactivated &&
        (peer.deactivationReason === Peer.DEACTIVATED_REASON_BANNED ||
            peer.deactivationReason === Peer.DEACTIVATED_REASON_DELETED);
    const onOnboardingTooltipClose = () => {
        dispatch({
            type: 'UserSeenHelpHint',
            hintId: 'im:web_return_to_previous_chat',
        });
    };
    const handleClosePostponedMessagesScreenOnboardingTooltip = () => {
        dispatch({
            type: 'UserSeenHelpHint',
            hintId: 'im:postponed_messages_screen',
        });
    };
    const postponedMessagesCount = convo.postponed.count;
    const isPostponedMessagesScreenOnboardingVisible = !rightPanel &&
        postponedMessagesCount > 0 &&
        helpHints.has('im:postponed_messages_screen');
    const hasSendPostponedError = Convo.hasPostponedMessagesError(convo);
    const postponedButton = (React.createElement(PostponedScreenButton, { hasSendPostponedError: hasSendPostponedError, onPostponedClick: onPostponedClick, postponedMessagesCount: postponedMessagesCount }));
    const rightControls = (React.createElement("div", { className: "ConvoHeader__controls", role: "toolbar" },
        Peer.isMarusia(peer.id) &&
            featureFlags.vkm_marusia_group_chat &&
            !isEdu && (React.createElement(MarusiaAddToGroupChatButton, { className: "ConvoHeader__action" })),
        calls &&
            !isFavorites &&
            owner.kind !== 'Group' &&
            peer.kind !== 'Group' &&
            peer.kind !== 'Contact' &&
            (peer.canCall ||
                (peer.kind === 'User' && featureFlags.vkm_ignore_user_can_call)) &&
            (convo.canWrite.allowed ||
                convo.canWrite.reason === 'forbid_writing_for_all') && (React.createElement(CallDropdown, { peerId: convo.peerId, activeCall: convo.kind === 'ChatConvo' ? convo.activeCall : undefined })),
        React.createElement(OnboardingWrapper, { type: "tooltip", shown: screenRoute.kind === 'ConvoRoute' && !rightPanel, mode: "1", appearance: "lime", tilt: "left", tipPosition: "bottom-left", size: 48, content: lang.use('me_onboarding_conversation_search'), campaignName: "me_mvk:convo_search", screen: "mvk_convo", enableQuarantine: true },
            React.createElement("div", null,
                React.createElement(Tooltip, { delay: 1000, position: "bottom", align: "center", content: lang.use('me_search_in_peer') },
                    React.createElement("button", { className: "vkmListHeader__button ConvoHeader__action", onClick: onSearchClick, "aria-label": lang.use('me_search_in_peer') },
                        React.createElement(Icon24SearchOutline, null))))),
        isPostponedMessagesAvailable && (React.createElement(Tooltip, { delay: 1000, position: "bottom", align: "center", content: lang.use('me_open_postponed_screen_aria_label') }, isPostponedMessagesScreenOnboardingVisible ? (React.createElement(OnboardingMarkedTooltip, { shown: isPostponedMessagesScreenOnboardingVisible, tipPosition: "bottom-left", content: lang.use('me_postponed_messages_screen_onboarding'), size: 56, tilt: "right", onClose: handleClosePostponedMessagesScreenOnboardingTooltip, onClick: handleClosePostponedMessagesScreenOnboardingTooltip, onMarkerClick: () => {
                onPostponedClick();
                handleClosePostponedMessagesScreenOnboardingTooltip();
            } },
            React.createElement("div", null, postponedButton))) : (postponedButton))),
        (owner.kind !== 'Group' ||
            isCommunityMessaging ||
            convo.canWrite.allowed) && (React.createElement(Dropdown, { content: actionsMenu, align: "right", adaptive: true, hideOnClick: true }, (isOpened) => (React.createElement("button", { id: "convo-more-menu-trigger", className: "vkmListHeader__button ConvoHeader__action", "aria-label": lang.use('me_actions_more'), "aria-haspopup": "menu", "aria-expanded": isOpened, "aria-controls": "convo-more-menu" },
            React.createElement(Icon24MoreHorizontal, null)))))));
    return (React.createElement("header", { className: cx('ConvoHeader') },
        isBackButtonAvailable ? (React.createElement(Tooltip, { position: "bottom", align: "center", content: lang.use('me_route_back'), ref: (button) => setGoBackButton(button) },
            React.createElement("button", { "aria-label": lang.use('me_route_back'), className: "ConvoHeader__action ConvoHeader__back", onClick: handleBack },
                React.createElement(Icon24ChevronCompactLeft, null),
                React.createElement(OnboardingTooltip, { isOpen: helpHints.has('im:web_return_to_previous_chat') &&
                        availableOnboardingTooltips.has('im:web_return_to_previous_chat') &&
                        !rightPanel, text: lang.use('me_convo_back_button_tooltip'), align: "left", targetClassName: "ConvoHeader__back_onboardingTooltip", withCloseButton: true, closeOnHoverTarget: { current: goBackButton }, onClose: onOnboardingTooltipClose, closeTimeout: 10000 })))) : (React.createElement("button", { "aria-label": lang.use('me_close'), className: "ConvoHeader__action ConvoHeader__back", onClick: closeConvo },
            React.createElement(Icon24Cancel, null))),
        React.createElement(Link, { to: {
                kind: 'PeerPanel',
                peerId: peer.id,
                screenName: Peer.screenName(peer),
            }, className: "ConvoHeader__info" },
            React.createElement("div", { className: "ConvoHeader__avatar", role: "img" }, isFavorites ? (React.createElement(AvatarFavorites, { size: 32 })) : (React.createElement(Avatar, { peer: peer, size: 32, withOnline: true, withBirthday: true }))),
            React.createElement("div", { className: "ConvoHeader__infoContainer" },
                React.createElement(ConvoTitle, { peer: peer, isMuted: Convo.isMuted(convo), isCasper: Convo.isCasper(convo), className: "ConvoHeader__title", showEmployeeMark: true, isForbidedWritingForAll: Convo.isForbidedWritingForAll(convo) && !Convo.isDisabled(convo), TitleComponent: "h2" }),
                !isFavorites && !isSubheadHidden && (React.createElement(Subhead, { weight: "3", className: "ConvoHeader__status", useAccentWeight: true },
                    (peer.kind === 'User' || peer.kind === 'Contact') && (React.createElement(OnlineStatus, { user: peer, isTyping: !!typing })),
                    peer.kind === 'User' && (React.createElement(EmployeeVacationMark, { peer: peer, hasSeparator: true })),
                    convo.kind === 'ChatConvo' &&
                        convo.state === 'in' &&
                        lang.use(convo.isGroupChannel
                            ? 'me_channel_subscribers_count'
                            : 'me_group_members_count', {
                            num: convo.members.count,
                            formatted: 'regular',
                        }) +
                            (!!onlineMembersCount
                                ? `, ${onlineMembersCount} ${lang.use('me_spaces_info_members_online').toLowerCase()}`
                                : ''),
                    convo.kind === 'GroupConvo' &&
                        (peer.kind === 'Group' && peer.memberCount > 0
                            ? lang.use('me_channel_subscribers_count', {
                                num: peer.memberCount,
                                formatted: 'short',
                            })
                            : lang.use('me_community_label')))))),
        React.createElement(DeferredRendering, null, rightControls)));
};
const CallDropdown = React.memo(({ peerId, activeCall }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(Dropdown, { content: React.createElement(CallMenu, { callEntrypoint: "header", peerId: peerId, activeCall: activeCall, id: "convo-call-menu", "aria-labelledby": "convo-call-menu-trigger" }), align: "right", adaptive: true, hideOnClick: true }, (isOpened) => (React.createElement("button", { className: "vkmListHeader__button ConvoHeader__action", id: "convo-call-menu-trigger", "aria-label": lang.use('me_start_call'), "aria-haspopup": "menu", "aria-expanded": isOpened, "aria-controls": "convo-call-menu" },
        React.createElement(Icon24PhoneOutline, null)))));
});
const PostponedScreenButton = forwardRef(({ postponedMessagesCount, hasSendPostponedError, onPostponedClick }, ref) => {
    const { lang } = useBrowserEnv();
    const hasPostponedMessages = postponedMessagesCount > 0;
    const iconType = hasSendPostponedError
        ? 'error'
        : hasPostponedMessages
            ? 'counter'
            : null;
    const ariaLabelEmptyScreen = 'me_open_postponed_screen_aria_label';
    const ariaLabelHasError = 'me_open_postponed_screen_and_has_error_aria_label';
    const ariaLabelHasMessages = 'me_open_postponed_screen_and_has_messages_aria_label';
    let ariaLabel = ariaLabelEmptyScreen;
    if (iconType === 'counter') {
        ariaLabel = ariaLabelHasMessages;
    }
    else if (iconType === 'error') {
        ariaLabel = ariaLabelHasError;
    }
    return (React.createElement("button", { className: "vkmListHeader__button ConvoHeader__action", onClick: onPostponedClick, "aria-label": lang.use(ariaLabel), ref: ref },
        React.createElement(Icon28HistoryForwardOutline, { width: 24, height: 24, fill: iconType === 'counter'
                ? 'var(--vkui--color_background_accent_themed)'
                : 'currentColor' }),
        iconType === 'counter' && (React.createElement(Counter, { className: "ConvoHeader__postponedCounter", mode: "primary", size: "s" }, postponedMessagesCount)),
        iconType === 'error' && (React.createElement(Icon12ErrorCircleFill, { className: "ConvoHeader__postponedError", width: 18, height: 18 }))));
});
//# sourceMappingURL=ConvoHeader.js.map