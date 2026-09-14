import '../../ui/SpaceAvatarSelector/SpaceAvatarSelector.css';
import React from 'react';
import { SpaceAvatar } from '../../ui/SpaceAvatar/SpaceAvatar';
export const SpaceAvatarSelector = ({ space, }) => {
    return (React.createElement("div", { className: "SpaceAvatarSelector" },
        React.createElement(SpaceAvatar, { size: 72, image: space.avatar, alt: space.name })));
};
//# sourceMappingURL=SpaceAvatarSelector.js.map