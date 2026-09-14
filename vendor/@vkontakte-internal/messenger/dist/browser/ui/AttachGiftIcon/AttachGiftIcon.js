import '../../ui/AttachGiftIcon/AttachGiftIcon.css';
import React from 'react';
import { Flex } from '@vkontakte/vkui';
import cx from 'classnames';
import { rarityIconMap } from '../../ui/AttachGift/rarityIconMap';
const backgroundColors = {
    uncommon: '#4BB34B',
    rare: '#735CE6',
    legendary: '#E03FAB',
};
export function AttachGiftIcon({ rarityType, className, }) {
    const icon = rarityIconMap[rarityType];
    const backgroundColor = backgroundColors[rarityType];
    return (React.createElement(Flex, { justify: "center", align: "center", className: cx('AttachGiftIcon', className), style: { backgroundColor } }, icon));
}
//# sourceMappingURL=AttachGiftIcon.js.map