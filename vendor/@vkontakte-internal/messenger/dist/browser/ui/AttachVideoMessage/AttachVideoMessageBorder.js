import '../../ui/AttachVideoMessage/AttachVideoMessageBorder.css';
import React from 'react';
import cx from 'classnames';
export const AttachVideoMessageBorder = ({ shape, isOut, }) => {
    return (
    /**
     * Так как обводка должна быть больше самого видеосообщения,
     * увеличиваем width, height на 2px и делаем сдвиг на -1px
     */
    React.createElement("svg", { className: cx('AttachVideoMessageBorder', {
            'AttachVideoMessageBorder--out': isOut,
        }), style: { position: 'absolute', top: '-1px', left: '-1px' }, width: "218", height: "218", viewBox: "-1 -1 218 218", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
        React.createElement("path", { d: shape, strokeWidth: "1.5" })));
};
//# sourceMappingURL=AttachVideoMessageBorder.js.map