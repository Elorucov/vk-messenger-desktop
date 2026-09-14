import { useEffect, useRef } from 'react';
/**
 * Логгирование открытия профиля каналов
 */
export const IMChannelDetails = (props) => {
    const { children, onEvent, channelId } = props;
    const $handleEvent = useRef(onEvent);
    $handleEvent.current = onEvent;
    useEffect(() => {
        if (channelId) {
            $handleEvent.current({
                type: 'type_navgo',
                type_navgo: {
                    screen: 'im_channel_details',
                    destination_item: {
                        type: 'channel',
                        id: channelId,
                    },
                },
            });
        }
    }, [channelId]);
    return children;
};
//# sourceMappingURL=IMChannelDetails.js.map