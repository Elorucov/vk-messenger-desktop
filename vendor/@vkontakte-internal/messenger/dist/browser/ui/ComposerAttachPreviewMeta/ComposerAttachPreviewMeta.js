import '../../ui/ComposerAttachPreviewMeta/ComposerAttachPreviewMeta.css';
import React from 'react';
import cx from 'classnames';
export const ComposerAttachPreviewMeta = ({ children, rounded, offsetLength = 5, top, right, bottom, left, className, }) => {
    const classNames = [
        'ComposerAttachPreviewMeta',
        { 'ComposerAttachPreviewMeta--rounded': rounded },
        className,
    ];
    const offset = offsetLength + 'px';
    const style = {
        ...(top && { top: offset }),
        ...(right && { right: offset }),
        ...(bottom && { bottom: offset }),
        ...(left && { left: offset }),
        maxWidth: `calc(100% - ${2 * offsetLength}px)`,
    };
    return (React.createElement("div", { className: cx(classNames), style: style }, children));
};
//# sourceMappingURL=ComposerAttachPreviewMeta.js.map