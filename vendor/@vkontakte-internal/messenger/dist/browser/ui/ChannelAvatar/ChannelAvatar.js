import React from 'react';
import { BasicAvatar, } from '../../ui/BasicAvatar/BasicAvatar';
export const ChannelAvatar = ({ name, photo, size, className, }) => {
    return (React.createElement(BasicAvatar, { picture: photo, size: size, alt: name, content: name, className: className }));
};
//# sourceMappingURL=ChannelAvatar.js.map