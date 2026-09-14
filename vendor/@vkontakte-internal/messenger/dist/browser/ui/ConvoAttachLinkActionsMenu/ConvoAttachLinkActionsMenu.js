import React from 'react';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
import { Icon24MessageArrowRightOutline } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
export const ConvoAttachLinkActionsMenu = ({ cmid, id, goToMessage, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ActionsMenu, { id: id },
        React.createElement(ActionsMenuAction, { title: lang.use('me_attach_action_go_to_message'), leftIcon: React.createElement(Icon24MessageArrowRightOutline, null), onClick: () => goToMessage(cmid), type: "secondary" })));
};
//# sourceMappingURL=ConvoAttachLinkActionsMenu.js.map