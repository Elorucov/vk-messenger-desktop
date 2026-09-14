import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Emoji } from '../Emoji/Emoji';
import styles from './EmojiItem.module.css';
export function EmojiItem({ emoji, active, onEmojiClick, className, onClick, ...props }) {
    const clickHandler = (event) => {
        onClick?.(event);
        onEmojiClick?.(emoji);
    };
    return (_jsx("div", { className: classNames(className, styles.item, {
            [styles.itemActive]: active,
        }), onClick: clickHandler, ...props, children: _jsx(Emoji, { emoji: emoji }) }));
}
//# sourceMappingURL=EmojiItem.js.map