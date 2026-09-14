import React, { useCallback } from 'react';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { useBrowserEnv } from '../../hooks/misc';
import { 
// Icon20ShareOutline,
Icon24MessageArrowRightOutline, } from '@vkontakte/icons';
export const ConvoAttachAudioActionsMenu = ({ cmid, goToMessage }) => {
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
    return (React.createElement(ActionsMenu, null,
        React.createElement(ActionsMenuAction, { onClick: () => handleActionClick('go_to_message'), title: lang.use('me_attach_action_go_to_message'), leftIcon: React.createElement(Icon24MessageArrowRightOutline, null), type: "secondary" })));
};
//# sourceMappingURL=ConvoAttachAudioActionsMenu.js.map