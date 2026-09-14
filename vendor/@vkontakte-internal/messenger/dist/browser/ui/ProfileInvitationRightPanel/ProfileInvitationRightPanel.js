import React from 'react';
import './ProfileInvitationRightPanel.css';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useModal } from '../../hooks/useModal';
import { useRouter } from '../../ui/Router/Router';
import { RightPanel } from '../../ui/RightPanel/RightPanel';
import { RightPanelTitle } from '../../ui/RightPanel/RightPanelTitle';
import { RightPanelIconButton } from '../../ui/RightPanel/RightPanelIconButton';
import { CopyText } from '../../ui/CopyText/CopyText';
import { InfoCell } from '../../ui/InfoCell/InfoCell';
import { Icon24Back, Icon24CancelOutline, Icon20GearOutline, Icon28CopyOutline, Icon20Chain, Icon20CopyOutline, } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
export const ProfileInvitationRightPanel = ({ link, children, copyMessage, title, showSettings, className }) => {
    const snackbar = useSnackbar();
    const modal = useModal(undefined, 'rightPanel');
    const { screenRoute } = useRouter();
    const { lang } = useBrowserEnv();
    const onCopy = () => {
        snackbar({
            message: copyMessage,
            before: (React.createElement(Icon28CopyOutline, { className: "ProfileInvitationRightPanel__notificationIcon" })),
        });
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(InfoCell, { className: className, left: React.createElement("div", { className: "ProfileInvitationRightPanel__icon" },
                React.createElement(Icon20Chain, null)), right: React.createElement("div", { className: "ProfileInvitationRightPanel__rightBlockContainer" },
                React.createElement(CopyText, { text: link, onCopyDone: onCopy },
                    React.createElement("button", { "aria-label": lang.use('me_aria_convo_profile_copy_invite_link'), className: "ProfileInvitationRightPanel__rightBlock" },
                        React.createElement(Icon20CopyOutline, null))),
                showSettings && (React.createElement("button", { className: "ProfileInvitationRightPanel__rightBlock", "aria-label": lang.use('me_convo_profile_invite_settings'), onClick: modal.open },
                    React.createElement(Icon20GearOutline, null)))) },
            React.createElement(CopyText, { text: link, onCopyDone: onCopy },
                React.createElement("div", { className: "ProfileInvitationRightPanel__link" }, link))),
        React.createElement(RightPanel, { indexInStack: modal.indexInStack, isActive: modal.isActive, onEscape: modal.close, className: "RightPanel__profile" },
            React.createElement(RightPanelTitle, { left: React.createElement(RightPanelIconButton, { "aria-label": screenRoute.rp?.length ?? 0 > 1
                        ? lang.use('me_back')
                        : lang.use('me_cancel'), side: "left", onClick: modal.close }, (screenRoute.rp?.length ?? 0 > 1) ? (React.createElement(Icon24Back, null)) : (React.createElement(Icon24CancelOutline, null))) }, title),
            children)));
};
//# sourceMappingURL=ProfileInvitationRightPanel.js.map