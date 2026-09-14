import { useEffect, useRef } from 'react';
/**
 * Логгирование открытия папки каналов
 */
export const IMChannelsList = (props) => {
    const { children, onEvent } = props;
    const $handleEvent = useRef(onEvent);
    $handleEvent.current = onEvent;
    useEffect(() => {
        $handleEvent.current({
            type: 'type_navgo',
            type_navgo: {
                screen: 'im_channels_list',
                subtype: 'go',
            },
        });
    }, []);
    return children;
};
//# sourceMappingURL=IMChannelsList.js.map