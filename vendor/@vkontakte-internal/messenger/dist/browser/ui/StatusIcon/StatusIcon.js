import React from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
import { usePixelDensity } from '../../hooks/misc';
import './StatusIcon.css';
export const StatusIcon = ({ peer, size, className, ...restProps }) => {
    const isDense = usePixelDensity();
    const peerHasStatus = peer.kind === 'User' && peer.imageStatus;
    if (!peerHasStatus) {
        return null;
    }
    const actualSize = isDense ? size * 2 : size;
    const url = peer.imageStatus.images.find((photo) => actualSize <= photo.width && Boolean(photo.url))?.url;
    return (React.createElement("div", { ...restProps, className: cx(`StatusIcon--size-${size}`, className) },
        React.createElement("img", { alt: peer.imageStatus.name, src: url })));
};
//# sourceMappingURL=StatusIcon.js.map