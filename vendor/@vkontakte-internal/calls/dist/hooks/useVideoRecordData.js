import { useEffect, useMemo, useState } from 'react';
import { useTypedSelector } from './useTypedSelector';
import { videoGet } from '../services/backend';
import { handlePromiseError } from '../helpers/logger';
import { isUndefined } from '@vkontakte/vkjs';
import { isParticipantGroup } from '../helpers/participant';
/** получает мета данные с апи вк по записи звонка */
export function useVideoRecordData(p) {
    const [data, setData] = useState();
    const participant = useTypedSelector((state) => {
        return p.ownerId ? state.participants[p.ownerId] : undefined;
    });
    useEffect(() => {
        if (!p.isRecord || !p.ownerId || !p.videoId || participant) {
            return;
        }
        const abortController = new AbortController();
        /** `<owner_id>_<media_id>` */
        const videos = `${p.ownerId}_${p.videoId}`;
        videoGet({ videos }, { signal: abortController.signal }).then(setData).catch(handlePromiseError);
        return () => {
            abortController.abort();
        };
    }, [p.ownerId, p.videoId, p.isRecord, participant]);
    /** имя автора записи звонка */
    const recordAuthorDisplayName = useMemo(() => {
        let name = '';
        if (participant) {
            name = participant.shortName || participant.name || name;
        }
        else {
            const ownerId = data?.items[0].owner_id;
            if (!isUndefined(ownerId) && isParticipantGroup(ownerId) && data?.groups) {
                const group = data.groups.find((group) => {
                    /** в списке групп id группы будет положительным числом */
                    return group.id === -ownerId;
                });
                name = group?.name || name;
            }
        }
        return name;
    }, [data, participant]);
    return {
        data,
        recordAuthorDisplayName,
    };
}
//# sourceMappingURL=useVideoRecordData.js.map