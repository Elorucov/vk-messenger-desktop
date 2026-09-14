import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { unicodeToByteHex } from '../../utils/unicodeToByteHex';
import styles from './Emoji.module.css';
export function Emoji({ emoji, className, ...props }) {
    return (_jsx("i", { className: classNames(styles.emoji, `@${unicodeToByteHex(emoji)}`, className), "data-emoji": emoji, "data-testid": "emoji-keyboard-emoji-item", ...props }));
}
//# sourceMappingURL=Emoji.js.map