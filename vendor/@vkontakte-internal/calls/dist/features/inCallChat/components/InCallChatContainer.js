import { jsx as _jsx } from "react/jsx-runtime";
import { isEmptyPeerId, useCallsBridge } from '@vkontakte-internal/calls-core';
import styles from './InCallChatContainer.module.css';
export const InCallChatContainer = ({ chatId }) => {
    const bridge = useCallsBridge();
    if (isEmptyPeerId(chatId)) {
        return null;
    }
    return _jsx("div", { className: styles.container, children: bridge.renderChat?.(chatId) });
};
//# sourceMappingURL=InCallChatContainer.js.map