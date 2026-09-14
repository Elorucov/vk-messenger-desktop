import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTypedDispatch } from '../../hooks/useTypedDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { E_ACTION } from '../../constants';
import { CallManagementModal } from '../../components/CallManagementModal/CallManagementModal';
import { CallManagementMenu } from '../../components/CallManagementMenu/CallManagementMenu';
import { CallLink } from '../../components/CallLink/CallLink';
import { CallParticipantListWidget } from './CallParticipantListWidget';
import { GroupCallSetupWidget } from '../../containers/GroupCallSetupContainer';
import { loadCallUrlLink, setAnonymousJoin, setWaitingHallEnabled } from '../../actions/actions';
import { isParticipantAnonymOrContact } from '../../helpers/participant';
import { CallLinkSettings } from '../../components/CallLinkSettings/CallLinkSettings';
import { isRequireAuthToJoin, isWaitingHallEnabled } from '../../helpers/call';
import { WaitingHallListContainer } from '../../containers/WaitingHallListContainter';
import { Button } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../hooks/useLang';
import { ClickHouseEventType, useSendStatsService } from '../../stats/clickHouse';
import { getCallData, getGroupId, getModal, getMyDevice, getMyId, getCallDataShowChatHistory, } from '../../selectors';
import { toggleModal, updateConversation } from '../../actions';
import { ManagementModalView, modalHasType, ModalType, participantIsAdmin, } from '@vkontakte-internal/calls-core';
import { useCloseChildModal, useConditionalCloseModal } from '../../hooks/useCloseModal';
import { KickParticipantContainer } from '../../containers/KickParticipantContainer';
import { AssignAdminContainer } from '../../containers/AssignAdminContainer';
import { ChangeParticipantNameContainer } from '../../containers/ChangeParticipantNameContainer';
import { MuteParticipantWidget } from '../../containers/MuteParticipantWidget';
import { useAddClick } from '../../components/AddParticipants/hooks/useAddClick';
import { CallManagementToolbarWidget } from './CallManagementToolbar';
import { useConfig } from '../../services/config';
import { copyTextToClipboard } from '@vkontakte/vkjs';
import { observer } from 'mobx-react-lite';
import { createWidget } from '@vkontakte-internal/di';
import { CallManagementModelProvider, useCallManagementModel } from './CallManagementModel';
import { useIsMounted } from '@vkontakte-internal/react-utils';
import { messagesEditChat } from '../../services/backend';
import { Ranges } from '@vkontakte-internal/vk-utils';
const CallManagement = observer(function CallManagement() {
    const { activeDevicesCount, canFinishCall, forceCallFinish, leaveCall, modalView: view, showMoreWaitingHall, toggleShowChatHistory, } = useCallManagementModel();
    const modal = useTypedSelector(getModal);
    const dispatch = useTypedDispatch();
    const callData = useTypedSelector(getCallData);
    const callUrlLink = callData.callUrlLink || '';
    const { link_without_password: callShortLink = '', link_with_password: callShortLinkWithPassword = '', password: callPassword = '', } = callData.callShortCredentials ?? {};
    const myId = useTypedSelector(getMyId);
    const isMeAnonymOrContact = isParticipantAnonymOrContact(myId);
    const groupId = useTypedSelector(getGroupId);
    const localDevice = useTypedSelector(getMyDevice);
    const isAuthedByGroup = !!groupId;
    const [isShortLinkTabSelected, setIsShortLinkTabSelected] = useState(false);
    const [isCallUrlLinkLoading, setCallUrlLinkLoading] = useState(false);
    const [isCallUrlLinkCopied, setIsCallUrlLinkCopied] = useState(false);
    const [linkUpdated, setLinkUpdated] = useState(false);
    const [isWithBackButton, setIsWithBackButton] = useState(false);
    const [canChangeAnonymousSetting, setCanChangeAnonymousSetting] = useState(false);
    const [canInvalidateLink, setCanInvalidateLink] = useState(false);
    const [isWaitingHallBlockShown, setIsWaitingHallBlockShown] = useState(false);
    const [isServiceChatBlockShown, setIsServiceChatBlockShown] = useState(false);
    const isMemberAdditionAllowed = !!callData.conversation?.canAddMembers;
    const chatId = callData.conversation?.peerId;
    const { enableNewViewOfMuteActions, enableNewViewOfMuteActionsSferum, sferum: isSferum, enableChatHistoryToggle, enableChatHistoryToggleEdu, enableChatSettings, } = useConfig();
    const { getLang, langReplace } = useLang();
    const sendStats = useSendStatsService();
    const requireAuthToJoin = useTypedSelector(isRequireAuthToJoin);
    const isWaitingHallEnabledValue = useTypedSelector(isWaitingHallEnabled);
    const isServiceChatEnabled = callData.conversation?.isService;
    const shouldCloseModal = useCallback(() => !modal?.child, [modal]);
    const closeModal = useConditionalCloseModal(shouldCloseModal);
    const closeChildModal = useCloseChildModal();
    const hasNewViewOfMuteActions = isSferum ? enableNewViewOfMuteActionsSferum : enableNewViewOfMuteActions;
    const showChatHistory = useTypedSelector(getCallDataShowChatHistory);
    // TODO [react@>=19.0.0]: Заменить дженерик `T | undefined` на `T`
    const linkUpdatedTimeout = useRef(undefined);
    const isMounted = useIsMounted();
    const setView = useCallback((view) => {
        if (isMounted()) {
            dispatch(toggleModal(ModalType.MANAGEMENT, { view }));
        }
    }, []);
    const onClose = useCallback(() => {
        setIsWithBackButton(false);
        closeModal();
    }, [closeModal]);
    const onBack = useCallback(() => {
        setView(ManagementModalView.MAIN);
    }, [setView]);
    const getCallLinkUrl = (invalidate) => {
        const callId = callData.callId || '';
        setCallUrlLinkLoading(true);
        return loadCallUrlLink(dispatch, callId, invalidate, isAuthedByGroup ? groupId : 0)
            .catch((err) => {
            console.error(err);
            dispatch({
                type: E_ACTION.ERROR,
                text: getLang('calls_get_url_link_error_text'),
            });
        })
            .finally(() => {
            setCallUrlLinkLoading(false);
        });
    };
    const onLinkBlockClick = useCallback(() => {
        setIsWithBackButton(true);
        setView(ManagementModalView.CALL_LINK);
        if (callUrlLink) {
            return;
        }
        getCallLinkUrl(false).catch(() => {
            setView(ManagementModalView.MAIN);
        });
    }, [callData.callId, callUrlLink, setView]);
    const addUserClick = useAddClick(setView);
    const onLeaveCall = useCallback(() => {
        closeModal();
        forceCallFinish();
    }, [forceCallFinish, closeModal]);
    useEffect(() => {
        if (!callUrlLink && view === ManagementModalView.CALL_LINK) {
            getCallLinkUrl(false).catch(() => {
                setView(ManagementModalView.MAIN);
            });
        }
    }, [callUrlLink, view, setView]);
    useEffect(() => {
        const isAdmin = participantIsAdmin(localDevice);
        const canChangeAnonymousSetting = isAdmin;
        const canInvalidateLink = isAdmin;
        setCanChangeAnonymousSetting(canChangeAnonymousSetting);
        setCanInvalidateLink(canInvalidateLink);
        setIsWaitingHallBlockShown(isAdmin);
    }, [localDevice]);
    useEffect(() => {
        const isAdmin = participantIsAdmin(localDevice);
        setIsServiceChatBlockShown(isAdmin && enableChatSettings && !!chatId);
    }, [localDevice, enableChatSettings, chatId]);
    const onChangeRequireAuthToJoin = useCallback((allow) => {
        setAnonymousJoin(allow);
    }, []);
    const onChangeServiceChat = useCallback((allow) => {
        if (chatId) {
            messagesEditChat({
                chat_id: Ranges.convertChatPeerIdToChatId(Number(chatId)),
                is_service: allow ? 1 : 0,
            }).then((value) => {
                if (value) {
                    dispatch(updateConversation(allow));
                }
            });
        }
    }, [chatId]);
    const onChangeWaitingHall = useCallback((allow) => {
        setWaitingHallEnabled(allow);
        sendStats(allow ? ClickHouseEventType.WAITING_ROOM_ENABLED : ClickHouseEventType.WAITING_ROOM_DISABLED);
    }, [sendStats]);
    const onCallUrlLinkCopied = () => {
        const linkToCopy = isShortLinkTabSelected ? callShortLinkWithPassword : callUrlLink;
        copyTextToClipboard(linkToCopy).then(() => setIsCallUrlLinkCopied(true));
    };
    const onCallUrlLinkCopiedHide = useCallback(() => setIsCallUrlLinkCopied(false), []);
    const onCallUrlLinkInvalidateClick = useCallback(() => {
        getCallLinkUrl(true)
            .then(() => {
            setLinkUpdated(true);
            if (linkUpdatedTimeout.current) {
                clearTimeout(linkUpdatedTimeout.current);
            }
            linkUpdatedTimeout.current = setTimeout(() => {
                setLinkUpdated(false);
            }, 5000);
        })
            .catch(() => {
            setView(ManagementModalView.MAIN);
        });
    }, [callData.callId, callUrlLink]);
    const onShowChatHistoryChanged = () => {
        const nextValue = toggleShowChatHistory();
        sendStats(ClickHouseEventType.CALL_CHAT_HISTORY_TOGGLED, {
            session_id: callData?.callId || '',
            event_param: nextValue ? 1 : 0,
            reason: 'link_settings',
        });
    };
    return (_jsxs(_Fragment, { children: [view === ManagementModalView.MAIN && (_jsxs(CallManagementModal, { title: hasNewViewOfMuteActions
                    ? langReplace(getLang('calls_participant_management_count', activeDevicesCount), {
                        count: `${activeDevicesCount}`,
                    })
                    : getLang('calls_management_participants'), dataTestId: "calls_participant_list_modal_root", actionButtons: !hasNewViewOfMuteActions ? (_jsxs(_Fragment, { children: [canFinishCall && (_jsx(Button, { size: "m", "data-testid": "calls_exit_call_button_force_finish", onClick: onLeaveCall, mode: "secondary", children: getLang('calls_force_call_finish') }, "forceCallFinish")), _jsx(Button, { size: "m", "data-testid": "calls_exit_call_button_exit", "data-focus-first": true, onClick: leaveCall, children: getLang('calls_leave_call') }, "leave")] })) : undefined, onCloseModal: onClose, children: [hasNewViewOfMuteActions ? (_jsx(_Fragment, { children: !isMeAnonymOrContact && (_jsx(CallManagementToolbarWidget, { isAllowedAddMembers: isMemberAdditionAllowed, addUserClick: addUserClick, onLinkBlockClick: onLinkBlockClick })) })) : (_jsx(CallManagementMenu, { isLinkBlockShown: isMemberAdditionAllowed, linkBlockTitle: getLang('calls_menu_link'), onLinkBlockClick: onLinkBlockClick, callUrlLink: callUrlLink })), _jsx(CallParticipantListWidget, { addUserClick: addUserClick, onLinkBlockClick: onLinkBlockClick, onShowMoreWaitingHall: showMoreWaitingHall })] })), view === ManagementModalView.CALL_LINK && (_jsxs(CallManagementModal, { title: getLang('calls_management_link'), hint: requireAuthToJoin ? getLang('calls_management_link_anonymous_disallowed_hint') : '', onCloseModal: onClose, isWithBackButton: isWithBackButton, onBackClick: onBack, dataTestId: "calls_link_settings_modal_root", actionButtons: (canInvalidateLink
                    ? [
                        _jsx(Button, { size: "m", "data-testid": "calls_link_settings_button_invalidate", mode: "tertiary", onClick: onCallUrlLinkInvalidateClick, disabled: isCallUrlLinkLoading, children: getLang('calls_link_invalidate') }, "invalidate-link"),
                    ]
                    : []).concat([
                    _jsx(Button, { size: "m", "data-testid": "calls_link_settings_button_copy", "data-focus-first": true, disabled: isCallUrlLinkLoading, onClick: onCallUrlLinkCopied, children: getLang('calls_link_copy') }, "copy-button"),
                ]), children: [_jsx(CallLink, { link: callUrlLink, shortLink: callShortLink, password: callPassword, isLinkLoading: isCallUrlLinkLoading, isCopied: isCallUrlLinkCopied, isShortLinkTabSelected: isShortLinkTabSelected, handleTabSelection: setIsShortLinkTabSelected, hideCopiedText: onCallUrlLinkCopiedHide, onCopy: onCallUrlLinkCopied, linkUpdated: linkUpdated }), canChangeAnonymousSetting && (_jsx(CallLinkSettings, { onRequireAuthToJoinChanged: onChangeRequireAuthToJoin, requireAuthToJoin: requireAuthToJoin, isWaitingHallBlockShown: isWaitingHallBlockShown, onWaitingHallEnabledChanged: onChangeWaitingHall, isWaitingHallEnabled: isWaitingHallEnabledValue, isShowChatHistoryBlockShown: !isAuthedByGroup && (isSferum ? enableChatHistoryToggleEdu : enableChatHistoryToggle), isShowChatHistoryEnabled: showChatHistory, onShowChatHistoryChanged: onShowChatHistoryChanged, isServiceChatBlockShown: isServiceChatBlockShown, isServiceChatEnabled: isServiceChatEnabled, onServiceChatEnabledChanged: onChangeServiceChat }))] })), view === ManagementModalView.ADD_PARTICIPANTS && (_jsx(GroupCallSetupWidget, { isWithBackButton: true, onBackClick: onBack })), view === ManagementModalView.WAITING_HALL && (_jsx(WaitingHallListContainer, { isModal: true, isWithBackButton: true, onBackClick: onBack })), renderChildModal(modal?.child, closeChildModal)] }));
});
function renderChildModal(modal, closeChildModal) {
    if (modalHasType(modal, ModalType.KICK_PARTICIPANT)) {
        return _jsx(KickParticipantContainer, { ...modal.details, onClose: closeChildModal });
    }
    else if (modalHasType(modal, ModalType.ADMIN_ASSIGNMENT)) {
        return _jsx(AssignAdminContainer, { ...modal.details, onClose: closeChildModal });
    }
    else if (modalHasType(modal, ModalType.CHANGE_NAME)) {
        return _jsx(ChangeParticipantNameContainer, { ...modal.details, onClose: closeChildModal });
    }
    else if (modalHasType(modal, ModalType.MUTE_PARTICIPANT)) {
        return _jsx(MuteParticipantWidget, { ...modal.details, onClose: closeChildModal });
    }
    return null;
}
export const CallManagementWidget = createWidget(CallManagementModelProvider, CallManagement);
//# sourceMappingURL=CallManagementWidget.js.map