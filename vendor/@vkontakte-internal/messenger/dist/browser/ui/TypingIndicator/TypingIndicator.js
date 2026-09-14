import '../../ui/TypingIndicator/TypingIndicator.css';
import React from 'react';
import cx from 'classnames';
export const TypingIndicator = ({ type = 'text', className, animationDuration, }) => {
    const variant = {
        text: 'text',
        voice: 'voice',
        photo: 'file',
        video: 'file',
        file: 'file',
        videomessage: 'voice',
    }[type];
    const classes = cx('TypingIndicator', `TypingIndicator--${variant}`, className);
    const style = {
        '--typingAnimationDuration': animationDuration !== undefined && `${animationDuration}ms`,
    };
    return (React.createElement("div", { className: classes, style: style },
        React.createElement("div", { className: "TypingIndicator__particle" })));
};
//# sourceMappingURL=TypingIndicator.js.map