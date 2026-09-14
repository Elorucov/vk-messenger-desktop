import '../../ui/ChannelPostContentWrapper/ChannelPostContentWrapper.css';
import React, { forwardRef } from 'react';
import cx from 'classnames';
import { useColorScheme } from '@vkontakte/vkui';
import { useWithoutBubblesTheme } from '../../hooks/useWithoutBubblesTheme';
export const ChannelPostContentWrapper = forwardRef(({ className, children, isUnread }, ref) => {
    const isDarkTheme = useColorScheme() === 'dark';
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    return (React.createElement("div", { ref: ref, className: cx(className, 'ChannelPostContentWrapper', {
            'ChannelPostContentWrapper--unread': isUnread,
            'ChannelPostContentWrapper--bubble': !isWithoutBubblesTheme,
            'ChannelPostContentWrapper--dark': isDarkTheme,
        }) }, children));
});
ChannelPostContentWrapper.displayName = 'ChannelPostContentWrapper';
//# sourceMappingURL=ChannelPostContentWrapper.js.map