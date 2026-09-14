import React from 'react';
import { Icon24PollOutline } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import { ComposerAttachCard } from '../../ui/ComposerAttachCard/ComposerAttachCard';
import { ComposerAttachTools } from '../../ui/ComposerAttachTools/ComposerAttachTools';
import { useNow } from '../../hooks/useNow';
export const ComposerAttachPoll = ({ poll, source, }) => {
    const { lang } = useBrowserEnv();
    const now = useNow();
    return (React.createElement("div", { className: "ComposerAttachPoll" },
        React.createElement(ComposerAttachCard, { icon: React.createElement(Icon24PollOutline, null), main: poll.title, secondary: lang.use('me_attaches_poll') }),
        poll.canEdit && (!poll.endDate || poll.endDate > now) && (React.createElement(ComposerAttachTools, { media: poll, source: source }))));
};
//# sourceMappingURL=ComposerAttachPoll.js.map