import '../../ui/ConvoListFilter/ConvoListFilter.css';
import React from 'react';
import cx from 'classnames';
import { Icon12Mention, Icon20Cancel, Icon20ChevronLeftOutline, Icon20MessagesOutline, Icon20WorkOutline, } from '@vkontakte/icons';
import { UnreadCounter } from '../../ui/UnreadCounter/UnreadCounter';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { useBrowserEnv } from '../../hooks/misc';
import * as Filters from '../../../core/model/Filters';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
export const ConvoListFilter = ({ className, filter, currentFilter, unreadCount = 0, hasMentions = false, onSelect, onBack, onHide, }) => {
    const { lang } = useBrowserEnv();
    const isHeaderMode = currentFilter.kind !== 'all' && currentFilter.kind !== 'unread';
    const isFilterCanClose = onHide !== undefined;
    const filterTitleKey = Filters.snakeCaseId(filter);
    let icon;
    switch (filter) {
        case 'adTag':
        case 'all':
        case 'important':
        case 'unanswered':
        case 'unread':
            icon = React.createElement(React.Fragment, null);
            break;
        case 'messageRequest':
            icon = React.createElement(Icon20MessagesOutline, null);
            break;
        case 'businessNotify':
            icon = React.createElement(Icon20WorkOutline, null);
            break;
        default:
            return exhaustivenessCheck(filter);
    }
    const isMutedCounter = filter !== 'messageRequest' && filter !== 'businessNotify';
    return (React.createElement("div", { role: "button", tabIndex: 0, className: cx('ConvoListFilter', className, {
            'ConvoListFilter--headerMode': isHeaderMode,
            'ConvoListFilter--closable': isFilterCanClose,
        }), onClick: isHeaderMode ? undefined : () => onSelect(filter) },
        isHeaderMode && (React.createElement(Tooltip, { position: "top", content: lang.use('me_route_back') },
            React.createElement("button", { className: "ConvoListFilter__backIcon", type: "button", "aria-label": lang.use('me_route_back'), onClick: onBack },
                React.createElement(Icon20ChevronLeftOutline, null)))),
        filter !== currentFilter.kind && (React.createElement("div", { className: "ConvoListFilter__icons" },
            React.createElement("i", { role: "img", className: "ConvoListFilter__icon" }, icon),
            !isHeaderMode && isFilterCanClose && (React.createElement(Tooltip, { position: "top", content: lang.use('me_convo_list_folder_hide') },
                React.createElement("button", { type: "button", "aria-label": lang.use('me_convo_list_folder_hide'), className: "ConvoListFilter__close", onClickCapture: (e) => {
                        e.stopPropagation();
                        onHide(filter);
                    } },
                    React.createElement(Icon20Cancel, null)))))),
        React.createElement("span", { className: "ConvoListFilter__text" }, lang.use(`me_convo_list_folder_${filterTitleKey}`)),
        hasMentions && (React.createElement("div", { className: "ConvoListFilter__mention" },
            React.createElement(Icon12Mention, null))),
        unreadCount > 0 && (React.createElement(UnreadCounter, { className: "ConvoListFilter__counter", count: unreadCount, isMuted: isMutedCounter, size: 18 }))));
};
//# sourceMappingURL=ConvoListFilter.js.map