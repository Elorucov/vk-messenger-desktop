import { Icon24LockOutline } from '@vkontakte/icons';
import { useBrowserEnv, useInsertIntoCache, usePeers } from '../../hooks/misc';
import { useNow } from '../../hooks/useNow';
import '../../ui/AttachEvent/AttachEvent.css';
import { AttachmentCell } from '../../ui/AttachmentCell/AttachmentCell';
import { Link } from '../../ui/Link/Link';
import * as Peer from '../../../core/model/Peer';
import { isSameYear } from '../../../core/utils/misc';
import React, { useEffect } from 'react';
import { BasicAvatar } from '../../ui/BasicAvatar/BasicAvatar';
export const AttachEvent = ({ event, isInBubble, isOut, }) => {
    const now = useNow();
    const insertIntoCache = useInsertIntoCache();
    const { lang, api } = useBrowserEnv();
    const peers = usePeers();
    // @TODO Убрать загрузку группы после завершения ME-47842
    useEffect(() => {
        if (peers.has(event.id)) {
            return;
        }
        api
            .fetch('groups.getById', { group_ids: Peer.toRealId(event.id).toString() }, { retries: 2 })
            .then((responseGroups) => {
            insertIntoCache({
                groups: responseGroups.groups,
            });
        });
        // Загрузка группы при первом рендере
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event.id, peers]);
    const group = Peer.safeGet(peers, event.id);
    if (!group) {
        return null;
    }
    const isEventPrivate = group.isClosed && group.membership !== 'member';
    if (isEventPrivate) {
        return (React.createElement(AttachmentCell, { title: lang.use('me_attaches_private_event'), icon: React.createElement(Icon24LockOutline, null), isInBubble: isInBubble, isOut: isOut, isAvailable: false }));
    }
    return (React.createElement(Link, { to: {
            kind: 'AttachProxyRoute',
            attach: event,
        }, className: "AttachEvent" },
        React.createElement(AttachmentCell, { title: group.name, subtitle: event.time
                ? [
                    lang.use('me_attaches_event'),
                    lang.use(isSameYear(now, event.time)
                        ? 'global_short_date_time'
                        : 'global_date_year_time', {
                        now,
                        date: event.time,
                    }),
                ]
                : lang.use('me_attaches_event'), image: React.createElement(BasicAvatar, { picture: group.photo, size: 40, alt: "", content: "", className: "AttachEvent__BasicAvatar" }), isInBubble: isInBubble, isOut: isOut })));
};
//# sourceMappingURL=AttachEvent.js.map