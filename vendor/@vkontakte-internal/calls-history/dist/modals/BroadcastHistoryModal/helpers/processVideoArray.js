import { getBroadcastVideoLink } from './getBroadcastVideoLink';
export const processVideoArray = (items, sferum, broadcastIds) => {
    const leftBroadcastIds = [...broadcastIds];
    const processedItems = items.map((item) => {
        const broadcastIdIndex = leftBroadcastIds.findIndex((id) => id.split('_')[1].includes(`${item.id}`));
        if (broadcastIdIndex > -1) {
            leftBroadcastIds.splice(broadcastIdIndex, 1);
        }
        return {
            id: item.id ?? Math.random() * 100,
            title: item.title ?? '',
            owner: {
                name: '',
                href: '',
            },
            description: item.description,
            views: item.views,
            duration: item.duration,
            href: getBroadcastVideoLink({
                owner_id: item.owner_id,
                id: item.id,
                access_key: item.access_key,
                player: item.player,
            }, sferum),
            ...(item.restriction
                ? {
                    restriction: {
                        iconType: 'delete',
                        mode: 'hide',
                        title: item.title,
                    },
                }
                : {
                    thumbSrc: item.image?.[4]?.url || item.image?.[5]?.url || item.image?.[0]?.url,
                }),
        };
    });
    return {
        processedItems,
        leftBroadcastIds,
    };
};
//# sourceMappingURL=processVideoArray.js.map