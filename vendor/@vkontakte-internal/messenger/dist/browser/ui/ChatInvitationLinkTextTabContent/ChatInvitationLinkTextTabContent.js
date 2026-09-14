import '../../ui/ChatInvitationLinkTextTabContent/ChatInvitationLinkTextTabContent.css';
import React from 'react';
import { Input, Button } from '@vkontakte/vkui';
import { Icon20CheckCircleOutline, Icon20CopyOutline, Icon20ShareOutline, } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import { useSnackbar } from '../../hooks/useSnackbar';
import { ChatInvitationLinkTab } from '../../ui/ChatInvitationLink/ChatInvitationLink';
import { CopyText } from '../../ui/CopyText/CopyText';
export const TEXT_TAB_PANEL_ID = 'invite_link_text_panel';
export const TEXT_TAB_PANEL_CONTROL_ID = 'invite_link_text_panel_control';
/**
 * Панель с ссылкой-приглашением в чат в виде текста.
 */
export const ChatInvitationLinkTextTabContent = ({ canEdit, currentLink = '', forwardModal, resetModal }) => {
    const { lang } = useBrowserEnv();
    const snackbar = useSnackbar();
    const [beforeResetLink, afterResetLink] = lang
        .use('me_invite_link_reset_explainer', {
        values: {
            reset_link: ' {reset_link}',
        },
    })
        .split('{reset_link}');
    return (React.createElement("div", { id: TEXT_TAB_PANEL_ID, tabIndex: 0, "aria-labelledby": TEXT_TAB_PANEL_CONTROL_ID, className: "ChatInvitationLinkTextTabContent" },
        React.createElement("div", { className: "ChatInvitationLinkTextTabContent__inputWrapper" },
            React.createElement(Input, { value: currentLink, readOnly: true, type: "text", "aria-label": lang.use('me_convo_profile_chat_link') })),
        canEdit && (React.createElement("div", { className: "ChatInvitationLinkTextTabContent__linkResetWrapper" },
            beforeResetLink,
            React.createElement("button", { className: "ChatInvitationLinkTextTabContent__linkReset", onClick: () => {
                    if (!resetModal?.current) {
                        return;
                    }
                    resetModal.current.open();
                } }, lang.use('me_invite_link_reset')),
            afterResetLink)),
        currentLink && (React.createElement("div", { className: "ChatInvitationLinkTextTabContent__buttonWrapper" },
            React.createElement(CopyText, { onCopyDone: () => snackbar({
                    message: lang.use('me_invite_link_copied'),
                    before: (React.createElement(Icon20CheckCircleOutline, { fill: "var(--vkui--color_icon_accent)" })),
                }), text: currentLink },
                React.createElement(Button, { mode: "secondary", size: "l", stretched: true, before: React.createElement(Icon20CopyOutline, null) }, lang.use('me_invite_link_copy'))),
            React.createElement(Button, { mode: "secondary", size: "l", stretched: true, onClick: () => {
                    if (!forwardModal.current) {
                        return;
                    }
                    forwardModal.current.open({
                        kind: ChatInvitationLinkTab.Text,
                        data: currentLink,
                    });
                }, before: React.createElement(Icon20ShareOutline, null) }, lang.use('me_invite_link_forward'))))));
};
//# sourceMappingURL=ChatInvitationLinkTextTabContent.js.map