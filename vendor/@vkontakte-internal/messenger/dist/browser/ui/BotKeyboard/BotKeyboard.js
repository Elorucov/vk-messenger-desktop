import '../../ui/BotKeyboard/BotKeyboard.css';
import React from 'react';
import { BotButton } from '../../ui/BotButton/BotButton';
import cx from 'classnames';
import { ButtonGroup } from '@vkontakte-internal/vkcom-kit';
export const BotKeyboard = ({ inline, cmid, keyboard, onButtonClick, onCallbackButtonClick, className, isCompact, }) => {
    return (React.createElement("div", { className: cx('MEAppThemeStylesContrastDisable', {
            'BotKeyboard--inline': inline,
            'BotKeyboard--full': !inline,
            'BotKeyboard--compact': isCompact,
        }, className), onClick: (e) => e.stopPropagation(), role: "menu" }, keyboard.buttons.map((row, idx) => (React.createElement(ButtonGroup, { className: "BotKeyboard__row", key: idx, gap: "s", role: "presentation", stretched: true }, row.map((button, idx) => (React.createElement(BotButton, { key: `${button.type}-${idx}`, className: "BotKeyboard__button", cmid: cmid, authorId: keyboard.authorId, inline: inline, isCompact: isCompact, onCallbackButtonClick: onCallbackButtonClick, onClick: onButtonClick, button: button }))))))));
};
//# sourceMappingURL=BotKeyboard.js.map