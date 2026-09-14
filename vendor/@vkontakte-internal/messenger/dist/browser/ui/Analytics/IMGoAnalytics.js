import { useEffect, useRef } from 'react';
import { exhaustivenessCheck } from '../../../core/utils/misc';
/**
 * Логгирование переходов по скринроутам
 */
export const IMGoAnalytics = (props) => {
    const { children, onEvent, id, type } = props;
    const { entrypoint: messageEntrypoint = undefined, peerId = undefined } = type === 'im_chat' ? props : {};
    const { entrypoint: channelEntrypoint = undefined, channelId = undefined } = type === 'im_channel' ? props : {};
    const $handleEvent = useRef(onEvent);
    $handleEvent.current = onEvent;
    useEffect(() => {
        if (type === 'im_chat' && peerId && messageEntrypoint) {
            $handleEvent.current({
                type: 'type_navgo',
                type_navgo: {
                    screen: 'im_chat',
                    subtype: 'go',
                    destination_item: { type: messageEntrypoint, id: peerId },
                },
            });
        }
    }, [peerId, messageEntrypoint, type]);
    useEffect(() => {
        if (type === 'im_channel' && channelId) {
            $handleEvent.current({
                type: 'type_navgo',
                type_navgo: {
                    screen: 'im_channel',
                    subtype: 'go',
                    destination_item: {
                        type: channelEntrypoint ?? 'channel',
                        id: channelId,
                    },
                },
            });
        }
    }, [type, channelId, channelEntrypoint]);
    useEffect(() => {
        if (type === 'im_channels_search') {
            $handleEvent.current({
                type: 'type_navgo',
                type_navgo: {
                    screen: 'im_channels_search',
                    subtype: 'go',
                },
            });
        }
    }, [type]);
    useEffect(() => {
        /**
         * Cобытия сгруппированы по сходству пропсов. При добавлении нового, если у него
         * есть доп. зависимости, то нужно создать для него свой эффект
         */
        switch (type) {
            case 'im':
                $handleEvent.current({
                    type: 'type_navgo',
                    type_navgo: {
                        screen: 'im',
                        subtype: 'go',
                    },
                });
                break;
            case 'im_settings':
                $handleEvent.current({
                    type: 'type_navgo',
                    type_navgo: {
                        screen: 'im_settings',
                        subtype: 'go',
                    },
                });
                break;
            case 'im_chat':
            case 'im_channel':
            case 'im_channels_search':
                break;
            default:
                exhaustivenessCheck(type);
        }
    }, [type, id]);
    return children;
};
//# sourceMappingURL=IMGoAnalytics.js.map