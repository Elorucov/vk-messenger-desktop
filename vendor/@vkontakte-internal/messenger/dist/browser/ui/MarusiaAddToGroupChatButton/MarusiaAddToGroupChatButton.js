import '../../ui/MarusiaAddToGroupChatButton/MarusiaAddToGroupChatButton.css';
import React, { useEffect, useRef, useState } from 'react';
import { Icon24MessageAddBadgeOutline } from '@vkontakte/icons';
import { useBrowserEnv, useDispatch, useHelpHints } from '../../hooks/misc';
import { useCallback } from 'react';
import { OnboardingTooltip } from '../../ui/OnboardingTooltip/OnboardingTooltip';
import { useRouter } from '../../ui/Router/Router';
export const MarusiaAddToGroupChatButton = ({ className }) => {
    const { marusia, lang } = useBrowserEnv();
    const { rightPanel } = useRouter();
    const hints = useHelpHints();
    const dispatch = useDispatch();
    const isMarusiaHintActive = Boolean(hints.has(ADD_TO_GROUP_CHAT_HINT_ID));
    const [canShowHint, setCanShowHint] = useState(isMarusiaHintActive && !rightPanel);
    const buttonRef = useRef(null);
    useEffect(() => {
        dispatch({
            type: 'UserSeenHelpHint',
            hintId: ADD_TO_GROUP_CHAT_HINT_ID,
        });
    }, [dispatch]);
    const handleClick = useCallback(() => {
        setCanShowHint(false);
        marusia?.handleAction({ type: 'click_group_chat_button' });
    }, [marusia]);
    const handleClose = useCallback(() => {
        setCanShowHint(false);
    }, []);
    return (React.createElement("div", { className: "MarusiaAddToGroupChatButton__container" },
        React.createElement("button", { ref: buttonRef, className: className, onClick: handleClick, "aria-label": lang.use('me_marusia_add_to_group_chat') },
            React.createElement(Icon24MessageAddBadgeOutline, null)),
        React.createElement(OnboardingTooltip, { isOpen: canShowHint, onClose: handleClose, text: React.createElement("div", { className: "MarusiaAddToGroupChatButton__text" }, lang.use('me_marusia_add_to_group_chat')), align: "right", position: "bottom", closeOnHoverTarget: buttonRef, closeTimeout: 10000, targetClassName: "MarusiaAddToGroupChatButton__tooltip" })));
};
const ADD_TO_GROUP_CHAT_HINT_ID = 'voice_assistant:add_to_group_chat';
//# sourceMappingURL=MarusiaAddToGroupChatButton.js.map