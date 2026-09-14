import '../../ui/ConvoMessageInfoTooltip/ConvoMessageInfoTooltip.css';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import React from 'react';
import * as Peer from '../../../core/model/Peer';
import { useBrowserEnv } from '../../hooks/misc';
export const ConvoMessageInfoTooltip = ({ adminAuthor }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(Tooltip, { content: lang.use('me_convo_message_header_admin_tooltip'), tooltipClassName: "ConvoMessageInfoTooltip", delay: 500, position: "top", align: "center", vkuiStyle: true, disabled: false },
        React.createElement("span", null, lang.use('me_convo_list_author_parenthesis', {
            values: {
                name: Peer.shortName(adminAuthor, 'nom', false),
            },
        }))));
};
//# sourceMappingURL=ConvoMessageInfoTooltip.js.map