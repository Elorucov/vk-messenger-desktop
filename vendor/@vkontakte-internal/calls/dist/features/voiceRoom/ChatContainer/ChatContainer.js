import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { useCallsBridge } from '@vkontakte-internal/calls-core';
export const ChatContainer = () => {
    const bridge = useCallsBridge();
    return _jsx("div", { className: "VoiceRoom__chatContainer", children: bridge.renderChat?.() });
};
//# sourceMappingURL=ChatContainer.js.map