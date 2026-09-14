import '../../ui/ConvoAttachesAudios/ConvoAttachesAudios.css';
import React, { Fragment, useMemo } from 'react';
import { useBrowserEnv } from '../../hooks/misc';
import { Icon20MessageArrowRightOutline } from '@vkontakte/icons';
import { ActionsMenuAction } from '../../ui/ActionsMenu/ActionsMenu';
import { AttachAudio } from '../../ui/AttachAudio/AttachAudio';
export const ConvoAttachesAudios = ({ attaches, goToMessage, }) => {
    const { lang } = useBrowserEnv();
    const now = Date.now();
    let month = null;
    return (React.createElement("ul", { className: "ConvoAttachesAudios" }, attaches.map((item) => {
        const date = new Date(item.date * 1000);
        const attachMonth = date.getMonth();
        const shouldDisplayDate = month === null || attachMonth !== month;
        month = attachMonth;
        return (React.createElement(Fragment, { key: `${item.cmid}-${item.attach.id}` },
            shouldDisplayDate && (React.createElement("div", { className: "ConvoAttachesAudios__separator" }, lang.use('me_month_year_date', {
                now,
                date: item.date * 1000,
                genMonths: false,
            }))),
            React.createElement(Item, { item: item, goToMessage: goToMessage })));
    })));
};
const Item = ({ item, goToMessage, }) => {
    const { lang } = useBrowserEnv();
    const actions = useMemo(() => (React.createElement(ActionsMenuAction, { key: "action_go_to_message", onClick: () => goToMessage(item.cmid), title: lang.use('me_attach_action_go_to_message'), leftIcon: React.createElement(Icon20MessageArrowRightOutline, null) })), [lang, goToMessage, item]);
    return (React.createElement("li", { className: "ConvoAttachesAudios__audio" },
        React.createElement(AttachAudio, { audio: item.attach, actions: actions, isOut: false, isInBubble: false })));
};
//# sourceMappingURL=ConvoAttachesAudios.js.map