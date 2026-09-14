import React, { useCallback } from 'react';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
import { 
// Icon20ShareOutline,
Icon24MessageArrowRightOutline, } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import { exhaustivenessCheck } from '../../../core/utils/misc';
export const ConvoAttachDocActionsMenu = ({ cmid, id, goToMessage, }) => {
    const { lang } = useBrowserEnv();
    const handleActionClick = useCallback((action) => {
        switch (action) {
            case 'share':
                // @todo Поделиться аттачем
                return;
            case 'go_to_message':
                goToMessage(cmid);
                return;
            default:
                return exhaustivenessCheck(action);
        }
    }, [cmid, goToMessage]);
    return (React.createElement(ActionsMenu, { id: id },
        React.createElement(ActionsMenuAction, { title: lang.use('me_attach_action_go_to_message'), leftIcon: React.createElement(Icon24MessageArrowRightOutline, null), onClick: () => handleActionClick('go_to_message'), type: "secondary" })));
};
//# sourceMappingURL=ConvoAttachDocActionsMenu.js.map