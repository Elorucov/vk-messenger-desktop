import '../../ui/ComposerOverMessage/ComposerOverMessage.css';
import React from 'react';
import { Icon20Cancel } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import cx from 'classnames';
import { useNow } from '../../hooks/useNow';
import { Time } from '../../ui/Time/Time';
export const ComposerOverMessage = ({ className, content, title, date, highlighted, onClick, onRemove, actions, isCompactView, }) => {
    const { lang } = useBrowserEnv();
    const now = useNow();
    const formattedDate = date
        ? lang.use('global_short_date_time', {
            now,
            date,
            shortMonths: true,
        })
        : null;
    return (React.createElement("div", { className: cx(className, 'ComposerOverMessage', {
            'ComposerOverMessage--highlighted': highlighted,
            'ComposerOverMessage--compact': isCompactView,
        }), onMouseDown: (e) => {
            // Чтобы не терялся фокус
            e.preventDefault();
        }, onClick: onClick },
        React.createElement("div", { className: "ComposerOverMessage__wrapper" },
            React.createElement("div", { className: "ComposerOverMessage__actions" }, actions),
            React.createElement("div", { className: "ComposerOverMessage__separator" }),
            React.createElement("div", { className: "ComposerOverMessage__title" },
                React.createElement("span", { className: "ComposerOverMessage__name" }, title),
                formattedDate && (React.createElement(Time, { formattedDate: formattedDate, ariaVersionFormattedDate: formattedDate, className: "ComposerOverMessage__date" }))),
            React.createElement("div", { className: "ComposerOverMessage__content" }, content),
            React.createElement("button", { className: "Composer__button ComposerOverMessage__close", onClick: (e) => {
                    // предотвращаем срабатывание onClick (например, если мы в onClick передали ф-цию скролла к сообщению, то при удалении мы не хотим скроллиться к реплаемому сообщению)
                    e.stopPropagation();
                    onRemove();
                } },
                React.createElement(Icon20Cancel, null)))));
};
//# sourceMappingURL=ComposerOverMessage.js.map