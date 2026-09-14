import React from 'react';
import * as Message from '../../../core/model/Message';
import { useBrowserEnv } from '../../hooks/misc';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { useNow } from '../../hooks/useNow';
export const ConvoMessageEditedTimeTooltip = ({ children, message, }) => {
    const { lang } = useBrowserEnv();
    const now = useNow();
    if (!message.updatedAt) {
        return children;
    }
    return (React.createElement(Tooltip, { content: lang.use('me_message_edited_tooltip', {
            values: {
                time: lang.formatDate(message.updatedAt, {
                    variant: 'time-ago',
                    now,
                }),
            },
        }), delay: 1000, position: "top", align: "center", disabled: message.kind !== 'Foreign' && !Message.isMessageEdited(message), watchContentChange: true }, children));
};
//# sourceMappingURL=ConvoMessageEditedTimeTooltip.js.map