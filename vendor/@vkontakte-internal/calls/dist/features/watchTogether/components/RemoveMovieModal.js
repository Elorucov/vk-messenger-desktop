import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { Button } from '@vkontakte-internal/vkcom-kit';
import { CallsModal } from '../../../components/CallsModal';
import { useLang } from '../../../hooks/useLang';
function getTexts(type, getLang) {
    switch (type) {
        case 'endVideo':
            return {
                title: getLang('calls_remove_movie_modal_title'),
                body: getLang('calls_remove_movie_modal_content'),
                yesButton: getLang('calls_remove_movie_modal_complete'),
            };
        case 'changeVideo':
            return {
                title: getLang('calls_play_movie_modal_title'),
                body: getLang('calls_play_movie_modal_content'),
                yesButton: getLang('calls_yes_play'),
            };
    }
}
export const RemoveMovieModal = ({ type, onClose, onConfirm }) => {
    const { getLang } = useLang();
    const text = getTexts(type, getLang);
    return (_jsx(CallsModal, { onClose: onClose, title: text.title, className: "MovieChoose__innerModal", dataTestId: "calls_watch_together_stop_modal", actionButtons: [
            _jsx(Button, { size: "m", onClick: onClose, mode: "secondary", "data-testid": "calls_watch_together_stop_modal_cancel", children: getLang('calls_cancel') }, "cancel"),
            _jsx(Button, { mode: "primary", size: "m", onClick: onConfirm, "data-testid": "calls_watch_together_stop_modal_confirm", children: text.yesButton }, "confirm"),
        ], children: _jsx("div", { className: "MovieChoose__innerModalContent", "data-testid": "calls_watch_together_stop_modal_body", children: text.body }) }));
};
//# sourceMappingURL=RemoveMovieModal.js.map