import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { ButtonGroup } from '@vkontakte-internal/vkcom-kit';
import { RecordStatusWidget } from './RecordStatusWidget';
export const HeaderControlsContainer = () => {
    return (_jsx("div", { className: "VoiceRoom__headerControlsContainer", children: _jsx(ButtonGroup, { mode: "horizontal", gap: "s", children: _jsx(RecordStatusWidget, {}) }) }));
};
//# sourceMappingURL=HeaderControlsContainer.js.map