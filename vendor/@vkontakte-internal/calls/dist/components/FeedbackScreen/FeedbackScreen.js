import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Icon24CancelOutline } from '@vkontakte/icons';
import { AppRootProvider, Button, IconButton } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../hooks/useLang';
export const FeedbackScreen = ({ title, children, sendButtonClick, skipButtonClick, sendButtonDisabled = true, }) => {
    const { getLang } = useLang();
    return (_jsx(AppRootProvider, { children: _jsxs("div", { className: "FeedbackScreen", children: [_jsx("div", { className: "FeedbackScreen__close", children: _jsx(IconButton, { label: getLang('calls_feedback_skip'), onClick: skipButtonClick, children: _jsx(Icon24CancelOutline, {}) }) }), _jsx("div", { className: "FeedbackScreen__title", "aria-live": "polite", children: title }), children, _jsxs("div", { className: "FeedbackScreen__actions", children: [_jsx(Button, { "data-focus-first": true, size: "m", mode: "secondary", appearance: "overlay", onClick: skipButtonClick, children: getLang('calls_feedback_skip') }), _jsx(Button, { size: "m", mode: "primary", appearance: "overlay", onClick: sendButtonClick, disabled: sendButtonDisabled, children: getLang('calls_feedback_send') })] })] }) }));
};
//# sourceMappingURL=FeedbackScreen.js.map