import '../../ui/ConvoHistoryTyping/ConvoHistoryTyping.css';
import React from 'react';
import { useTypings } from '../../hooks/misc';
import { TypingIndicator } from '../../ui/TypingIndicator/TypingIndicator';
import cx from 'classnames';
export const ConvoHistoryTyping = ({ peerId, isThemed, isCompactView = false, showNames = true, }) => {
    const typing = useTypings(peerId, isCompactView ? 'compact' : 'full', !showNames ? 0 : isCompactView ? 2 : 3);
    if (!typing) {
        return null;
    }
    return (React.createElement("div", { className: cx('ConvoHistoryTyping', {
            'ConvoHistoryTyping--themed': isThemed,
        }) },
        React.createElement("div", { className: "ConvoHistoryTyping__wrapper" },
            React.createElement(TypingIndicator, { type: typing.type, className: "ConvoHistoryTyping__indicator" }),
            React.createElement("div", { className: "ConvoHistoryTyping__text" }, typing.text))));
};
//# sourceMappingURL=ConvoHistoryTyping.js.map