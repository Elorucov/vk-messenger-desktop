import { ContentBadge } from '@vkontakte/vkui';
import React from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
import './AdultBadge.css';
export const AGE_LIMITS_MAPPING = {
    1: '',
    2: '16',
    3: '18',
};
export const AdultBadge = ({ className, ageLimits, onClick, }) => {
    return (React.createElement(ContentBadge, { "data-testid": `adult_badge_${AGE_LIMITS_MAPPING[ageLimits]}`, className: cx('AdultBadge', className), onClick: onClick, size: "s", appearance: "overlay", mode: "secondary" }, AGE_LIMITS_MAPPING[ageLimits] + '+'));
};
//# sourceMappingURL=AdultBadge.js.map