import React from 'react';
import * as Attach from '../../../core/model/Attach';
import { useViewer } from '../../hooks/misc';
import { Link } from '../../ui/Link/Link';
import './ServiceMessageAttach.css';
import { MissedCall } from './MissedCall';
import cx from 'classnames';
export const ServiceMessageAttach = ({ message, isCompact = false, isInBubble }) => {
    const { viewer } = useViewer();
    switch (message.action.type) {
        case 'cannot_call_privacy_settings': {
            if (viewer.id === message.authorId) {
                return null;
            }
            return (React.createElement(MissedCall, { className: cx('ServiceMessageAttach__missedCall', {
                    'ServiceMessageAttach__missedCall--inBubble': isInBubble,
                }), message: message, isInBubble: isInBubble }));
        }
        case 'chat_photo_update':
            if (!message.action.photo) {
                return null;
            }
            return (React.createElement(Link, { disabled: !message.action.photo, to: {
                    kind: 'AttachMediaProxyRoute',
                    attach: message.action.photo,
                } },
                React.createElement(Photo, { photo: message.action.photo, isCompact: isCompact })));
        default:
            return null;
    }
};
// 75 – это размер 's'
const COMPACT_PHOTO_SIZE = 75;
// 130 – это размер 'm'
const NORMAL_PHOTO_SIZE = 130;
/*
  Отдельные компоненты аттачментов для сервисных сообщений нужны, чтобы была возможность рендерить аттачи
  для сервисных сообщений и обычных сообщений по-разному если понадобится.
 */
const Photo = ({ photo, isCompact, }) => {
    const size = isCompact ? 's' : 'm';
    const sideSize = isCompact ? COMPACT_PHOTO_SIZE : NORMAL_PHOTO_SIZE;
    const scaledSize = sideSize * window.devicePixelRatio;
    const image = Attach.preview(photo, scaledSize, scaledSize, true);
    if (!image) {
        return null;
    }
    return (React.createElement("div", { className: cx('ServiceMessageAttach__photo', `ServiceMessageAttach__photo--size-${size}`) },
        React.createElement("div", { className: "ServiceMessageAttach__photo-image" },
            React.createElement("img", { src: image.url, alt: "" }))));
};
//# sourceMappingURL=ServiceMessageAttach.js.map