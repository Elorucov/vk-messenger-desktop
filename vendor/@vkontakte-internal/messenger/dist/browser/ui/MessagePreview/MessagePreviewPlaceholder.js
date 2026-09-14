import React from 'react';
import { useBrowserEnv } from '../../hooks/misc';
import * as Convo from '../../../core/model/Convo';
export const MessagePreviewPlaceholder = ({ convo }) => {
    const { lang } = useBrowserEnv();
    if (Convo.isCasper(convo)) {
        return (React.createElement("span", { className: "MessagePreview" }, lang.use('me_message_expired', { num: 1 })));
    }
    return null;
};
//# sourceMappingURL=MessagePreviewPlaceholder.js.map