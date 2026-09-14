import React, { useCallback, useState } from 'react';
import { useBrowserEnv } from '../../hooks/misc';
import { getReactionLangById } from '../../utils/reactions';
import { MessageReactionImage } from '../../ui/MessageReactionImage/MessageReactionImage';
import { classNames as cx } from '@vkontakte/vkjs';
import './MessageReactionPickerItem.css';
export const MessageReactionPickerItem = ({ reaction, active, disableAnimation, size, onClick, }) => {
    const { lang } = useBrowserEnv();
    const [hover, setHover] = useState(false);
    const handleClick = useCallback(() => {
        onClick?.(reaction.id);
    }, [onClick, reaction.id]);
    const onMouseEnter = useCallback(() => setHover(true), []);
    const onMouseLeave = useCallback(() => setHover(false), []);
    const langKey = getReactionLangById(reaction.id);
    return (React.createElement("button", { type: "button", className: cx('MessageReactionPickerItem', {
            'MessageReactionPickerItem--active': active,
        }), onClick: handleClick, onMouseEnter: onMouseEnter, onMouseLeave: onMouseLeave, "aria-pressed": active, "aria-label": langKey ? lang.use(langKey) : undefined },
        React.createElement("span", { className: "MessageReactionPickerItem__activeOverlay" }),
        React.createElement("span", { className: "MessageReactionPickerItem__hoverOverlay" }),
        React.createElement("span", { className: "MessageReactionPickerItem__content" },
            React.createElement(MessageReactionImage, { play: hover, loop: true, id: reaction.id, image: reaction.image, animationSmall: disableAnimation ? undefined : reaction.animationSmall, size: size }))));
};
//# sourceMappingURL=MessageReactionPickerItem.js.map