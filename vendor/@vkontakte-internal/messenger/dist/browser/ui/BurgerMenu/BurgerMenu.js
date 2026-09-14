import React, { memo, useMemo, useRef } from 'react';
import { Icon20ArchiveOutline, Icon20FavoriteOutline, Icon20UserSquareOutline, Icon20GearOutline, Icon20DoorArrowRightOutline, Icon16Done, Icon20MenuOutline, Icon20WorkOutline, Icon20HelpOutline, Icon20ServicesOutline, Icon20Search, Icon20PhoneOutline, Icon20Users3Outline, Icon20WriteSquareOutline, Icon20UsersOutline, Icon20MessagesOutline, } from '@vkontakte/icons';
import { useBrowserEnv, useFeatureFlags, useOwner, useViewer, } from '../../hooks/misc';
import * as Peer from '../../../core/model/Peer';
import * as Viewer from '../../../core/model/Viewer';
import { ActionsMenu, ActionsMenuAction, ActionsMenuDropdownAction, } from '../../ui/ActionsMenu/ActionsMenu';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import { SferumLogoSmall } from '../../ui/SferumLogoSmall/SferumLogoSmall';
import './BurgerMenu.css';
import { OnboardingTooltip } from '../../ui/OnboardingTooltip/OnboardingTooltip';
import { useSyncPoppers } from '../../hooks/useSyncPoppers';
import { useCollapsibleContainer } from '../../ui/CollapsibleContainer/CollapsibleContainer';
import { CallMenuAlternative } from '../../ui/CallMenuAlternative/CallMenuAlternative';
import { BasicAvatar } from '../../ui/BasicAvatar/BasicAvatar';
import { useRouter } from '../../ui/Router/Router';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { OnboardingWrapper } from '../../ui/OnboardingWrapper/OnboardingWrapper';
import { DeferredRendering } from '../../ui/DeferredRendering/DeferredRendering';
import { getLogEventLabel } from '../../../data/utils/typeMessagingActionItem';
export const BurgerMenu = memo(function BurgerMenu({ groups, accounts, selectedOrganiserFilter, availableActions, onAction, tooltipText, onCloseTooltip, onSetAccount, onSetGroupOwner, isMRFilterVisible, hasBusinessFolder, }) {
    const { lang, stats, calls } = useBrowserEnv();
    const { screenRoute } = useRouter();
    const featureFlags = useFeatureFlags();
    const owner = useOwner();
    const viewer = useViewer();
    const { isOpen: isMainPanelOpen } = useCollapsibleContainer();
    const isRegularOrTeacherUser = !Viewer.isEdu(viewer.profileType) || viewer.viewer.isVerified;
    const isEdu = Viewer.isEdu(viewer.profileType);
    const accountMenuActions = availableActions.has('accounts') && (React.createElement("div", { role: "group" }, accounts.map((account) => {
        const title = (React.createElement(React.Fragment, null,
            `${account.firstName} ${account.lastName}`,
            account.profileType === 'edu' && (React.createElement("span", { className: "BurgerMenuOwnerAction__sferumLogo" },
                React.createElement(SferumLogoSmall, null)))));
        return (React.createElement(BurgerMenuOwnerAction, { key: account.id, title: title, photo: account.photo, isActive: owner.id === account.id, onClick: () => {
                if (account.id !== owner.id) {
                    onSetAccount(account.id);
                }
            } }));
    })));
    const groupMenuActions = !!groups.length && (React.createElement("div", { role: "group" }, groups.map((group) => (React.createElement(BurgerMenuOwnerAction, { key: group.id, title: Peer.name(group), photo: group.photo, isActive: owner.id === group.id, onClick: () => {
            if (group.id !== owner.id) {
                onSetGroupOwner(group.id);
            }
        } })))));
    const handleContactsClick = () => {
        stats.logEvent({
            type: 'type_action',
            type_action: {
                type: 'type_messaging_action_item',
                type_messaging_action_item: {
                    action_type: 'BUTTON_CONTACTS',
                    label: getLogEventLabel(),
                },
            },
        });
        onAction('contacts');
    };
    const isTeacherOrAdmin = (viewer) => {
        const roleId = viewer.eduRoles?.mainRoleCode;
        switch (roleId) {
            case 'admin':
            case 'employee':
            case 'teacher':
                return true;
            case 'parent':
            case 'student':
            case undefined:
                return false;
            default:
                exhaustivenessCheck(roleId);
        }
    };
    const handleArchiveClick = () => {
        stats.logEvent({
            type: 'type_action',
            type_action: {
                type: 'type_messaging_action_item',
                type_messaging_action_item: {
                    action_type: 'BUTTON_ARCHIVE_2',
                    label: getLogEventLabel(),
                },
            },
        });
        onAction('archive');
    };
    const actionsList = (React.createElement(ScrollbarProvider, { role: "presentation", scrollableProps: {
            role: 'presentation',
        }, contentProps: {
            role: 'presentation',
        }, style: { maxHeight: 'calc(100vh - 175px)' }, overflowX: "hidden", forceVisible: "y" },
        !isMainPanelOpen && (React.createElement(React.Fragment, null,
            owner.kind !== 'Group' && (React.createElement(ActionsMenuDropdownAction, { title: lang.use('me_create_title'), icon: React.createElement(Icon20WriteSquareOutline, null), position: "right", align: "bottom", hideOnClick: false, onClick: () => {
                    onAction('openChatCreationPanel');
                } },
                React.createElement(ActionsMenuAction, { title: lang.use('me_new_chat_title'), leftIcon: React.createElement(Icon20UsersOutline, null), onClick: () => {
                        onAction('openChatCreationPanel');
                    }, type: "secondary" }),
                !featureFlags.vkm_channel_name_to_community &&
                    featureFlags.vkm_channel_creation_show && (React.createElement(ActionsMenuAction, { title: lang.use('me_channel_creation_button'), leftIcon: React.createElement(Icon20Users3Outline, null), onClick: () => onAction('openChannelCreationPanel'), type: "secondary" })),
                featureFlags.vkm_channel_name_to_community &&
                    isEdu &&
                    isTeacherOrAdmin(viewer.viewer) && (React.createElement(ActionsMenuAction, { title: lang.use('me_channel_creation_button'), leftIcon: React.createElement(Icon20Users3Outline, null), onClick: () => onAction('openChannelCreationPanel'), type: "secondary" })),
                isRegularOrTeacherUser && (React.createElement(ActionsMenuAction, { title: lang.use('me_write_by_phone_number'), leftIcon: React.createElement(Icon20PhoneOutline, null), onClick: () => onAction('openPhoneJoinModal'), type: "secondary" })))),
            owner.kind !== 'Group' &&
                calls &&
                (calls.env.canCreateCall ||
                    calls.env.canScheduleCall ||
                    calls.env.canNavigateToSeparateSection) && (React.createElement(ActionsMenuDropdownAction, { title: lang.use('me_new_call_title'), icon: React.createElement(Icon20PhoneOutline, null), position: "right", align: "bottom" },
                React.createElement(CallMenuAlternative, null))),
            React.createElement(ActionsMenuAction, { onClick: () => onAction('search'), title: lang.use('me_search'), leftIcon: React.createElement(Icon20Search, null), type: "secondary" }))),
        accountMenuActions,
        groupMenuActions,
        owner.kind !== 'Group' ? (React.createElement(React.Fragment, null,
            React.createElement("div", { role: "group" },
                React.createElement(ActionsMenuAction, { onClick: handleContactsClick, title: lang.use('me_route_contacts'), leftIcon: React.createElement(Icon20UserSquareOutline, null), type: "secondary" }),
                React.createElement(ActionsMenuAction, { title: lang.use('me_convo_list_important_messages'), onClick: () => onAction('important'), leftIcon: React.createElement(Icon20FavoriteOutline, null), type: "secondary" }),
                isMRFilterVisible && (React.createElement(ActionsMenuAction, { onClick: () => onAction('messageRequest'), title: lang.use('me_convo_list_folder_message_request'), leftIcon: React.createElement(Icon20MessagesOutline, null), type: "secondary" })),
                selectedOrganiserFilter !== 'archive' && (React.createElement(ActionsMenuAction, { onClick: handleArchiveClick, title: lang.use('me_convo_list_folder_archive'), leftIcon: React.createElement(Icon20ArchiveOutline, null), type: "secondary" })),
                !hasBusinessFolder &&
                    selectedOrganiserFilter !== 'businessNotify' &&
                    viewer.settings.businessNotify && (React.createElement(ActionsMenuAction, { onClick: () => onAction('businessNotify'), title: lang.use('me_convo_list_folder_business_notify'), leftIcon: React.createElement(Icon20WorkOutline, null), type: "secondary" }))),
            React.createElement("div", { role: "group" },
                Viewer.isEdu(viewer.profileType) && (React.createElement(ActionsMenuAction, { onClick: () => onAction('miniAppsCatalog'), title: lang.use('me_miniapps_catalog'), leftIcon: React.createElement(Icon20ServicesOutline, null), type: "secondary" })),
                React.createElement(ActionsMenuAction, { onClick: () => onAction('settings'), title: lang.use('me_route_settings'), leftIcon: React.createElement(Icon20GearOutline, null), type: "secondary" }),
                availableActions.has('help') && (React.createElement(ActionsMenuAction, { onClick: () => onAction('helpdesk'), title: lang.use('me_route_helpdesk'), leftIcon: React.createElement(Icon20HelpOutline, null), type: "secondary" })),
                availableActions.has('logout') && (React.createElement(ActionsMenuAction, { onClick: () => onAction('logout'), title: lang.use('me_logout'), leftIcon: React.createElement(Icon20DoorArrowRightOutline, null), type: "danger" }))))) : (React.createElement(React.Fragment, null, availableActions.has('logout') && (React.createElement("div", { role: "group" },
            React.createElement(ActionsMenuAction, { onClick: () => onAction('logout'), title: lang.use('me_logout'), leftIcon: React.createElement(Icon20DoorArrowRightOutline, null), type: "danger" })))))));
    const ref = useRef(null);
    const { registerPopper, isPopperOpen, isPopperLocked } = useSyncPoppers();
    const dropdown = useMemo(() => {
        const { onOpen, ...popper } = registerPopper({
            id: 'burger-menu',
            locks: ['burger-menu-tooltip'],
        });
        return {
            ...popper,
            onOpen: () => {
                stats.logEvent({
                    type: 'type_action',
                    type_action: {
                        type: 'type_messaging_action_item',
                        type_messaging_action_item: {
                            action_type: 'BUTTON_BURGER',
                            label: getLogEventLabel(),
                        },
                    },
                });
                onOpen();
            },
        };
    }, [stats, registerPopper]);
    const tooltip = useMemo(() => registerPopper({
        id: 'burger-menu-tooltip',
    }), [registerPopper]);
    const button = (React.createElement("button", { type: "button", id: "burger-menu-trigger", "aria-label": lang.use('me_burger_button_title'), "aria-haspopup": "menu", "aria-expanded": isPopperOpen('burger-menu'), "aria-controls": "burger-menu", className: "BurgerMenu__button" },
        React.createElement(Icon20MenuOutline, null)));
    return (React.createElement(DeferredRendering, { fallback: button },
        React.createElement("div", { className: "BurgerMenu" },
            React.createElement(Dropdown, { enableFocusTrap: true, disableInert: true, openType: "click", hideOnClick: true, adaptive: true, content: React.createElement(ActionsMenu, { id: "burger-menu", "aria-labelledby": "burger-menu-trigger", className: "BurgerMenu__actionsMenu" }, actionsList), align: "left", position: "bottom", open: isPopperOpen('burger-menu'), ...dropdown },
                React.createElement(OnboardingWrapper, { type: "tooltip", key: screenRoute.kind, shown: screenRoute.kind === 'MainRoute', mode: "1", appearance: "lime", tilt: "left", tipPosition: "bottom-right", size: 48, content: lang.use('me_onboarding_other_sections'), campaignName: "me_mvk:burger_menu_sections", screen: "mvk_convo_list", enableQuarantine: true },
                    React.createElement("div", { className: "BurgerMenu__hiddenFilterTooltipContainer", ref: ref },
                        React.createElement(Tooltip, { align: "center", content: lang.use('me_burger_button_title'), delay: 1000, disabled: isPopperLocked('burger-menu-tooltip'), position: "bottom", ...tooltip }, button),
                        React.createElement(OnboardingTooltip, { isOpen: Boolean(tooltipText), text: tooltipText, onClose: onCloseTooltip, closeOnHoverTarget: ref, position: "right", withCloseButton: true })))))));
});
export const BurgerMenuOwnerAction = ({ title, photo, isActive, onClick }) => {
    return (React.createElement(ActionsMenuAction, { leftIcon: photo && (React.createElement(BasicAvatar, { picture: photo, size: 20, content: title, alt: "" })), title: title, rightIcon: isActive && React.createElement(Icon16Done, null), onClick: onClick }));
};
//# sourceMappingURL=BurgerMenu.js.map