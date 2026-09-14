import * as Convo from '../../core/model/Convo';
import * as Filters from '../../core/model/Filters';
import * as Folders from '../../core/model/Folder';
import * as Tag from '../../core/model/Tag';
import { useMemo, useState } from 'react';
import { exhaustivenessCheck, isShallowEqual } from '../../core/utils/misc';
import { useMemoWithCustomCompare } from '../hooks/misc';
export function useConvoOrganiser(organisers, convosCache, initial, defaultFoldersFilter, disabled) {
    const [selectedOrganiser, setSelectedOrganiser] = useState(initial);
    const currentOrganiser = useMemo(() => {
        if (disabled) {
            const mockOrganiser = {
                organiser: selectedOrganiser,
                convos: [],
                hasMore: false,
            };
            return mockOrganiser;
        }
        let convos = [];
        switch (selectedOrganiser.kind) {
            case 'filters': {
                if (!(selectedOrganiser.filter in organisers.filters)) {
                    throw new Error('Выбрана несуществущая папка');
                }
                const filter = organisers.filters[selectedOrganiser.filter];
                convos = Array.from(filter.ids.convos, (peerId) => Convo.safeGet(convosCache, peerId)).sort((a, b) => Filters.sorter(a, b));
                return {
                    organiser: selectedOrganiser,
                    convos,
                    hasMore: filter.hasMore,
                };
            }
            case 'folders': {
                const folder = organisers.folders.find((folder) => folder.id === selectedOrganiser.id);
                // Такое может быть, если мы удалили папку
                // Просто переключаемся в папку по умолчанию(все)
                if (!folder) {
                    setSelectedOrganiser({
                        kind: 'filters',
                        filter: defaultFoldersFilter,
                    });
                    return {
                        organiser: { kind: 'filters', filter: defaultFoldersFilter },
                        hasMore: organisers.filters[defaultFoldersFilter].hasMore,
                        convos: Array.from(organisers.filters[defaultFoldersFilter].ids.convos, (peerId) => Convo.safeGet(convosCache, peerId)).sort((a, b) => Filters.sorter(a, b)),
                    };
                }
                const sublistsPeerIds = Folders.getSublistsPeerIds(folder, organisers.sublists);
                /**
                 * Чтобы исключить факт дублирования convo, если
                 * convo принадлежит саблисту папки и самой папке будет дубль
                 */
                const folderPeerIdsWithSublist = Array.from(new Set([...folder.peerIds, ...sublistsPeerIds]));
                /**
                 * Мы можем быть уверены, что все чаты отобразятся корректно, тк у нас есть фильтрация
                 * по boundaryMinorId, а его мы переопределяем только при дозагрузке новых чатов в moreConvosNedeed.
                 * То есть все что выше boundaryMonirId точно есть в кеше.
                 */
                const convos = folderPeerIdsWithSublist
                    .reduce((acc, peerId) => {
                    const convo = convosCache.get(peerId);
                    if (!convo) {
                        return acc;
                    }
                    /**
                     * Если у нас включен фильтр "только непрочитанные", тогда мы должна добавлять в
                     * список для отображения только непрочитанные convo.
                     * Если фильтра нет, тогда добавляем все
                     */
                    if (selectedOrganiser.filter !== 'unread' ||
                        Convo.isUnread(convo)) {
                        acc.push(convo);
                    }
                    return acc;
                }, [])
                    .sort((a, b) => Folders.sorter(a, b))
                    .filter((convo) => convo.minorSortId >=
                    folder[selectedOrganiser.filter].boundaryMinorId);
                return {
                    organiser: selectedOrganiser,
                    convos,
                    hasMore: folder[selectedOrganiser.filter].hasMore,
                };
            }
            case 'tags': {
                const actualMask = Tag.convertMask(organisers.tags.items, Tag.convertMask(organisers.tags.items, selectedOrganiser.mask));
                if (!actualMask) {
                    setSelectedOrganiser({
                        kind: 'filters',
                        filter: defaultFoldersFilter,
                    });
                    return {
                        organiser: { kind: 'filters', filter: defaultFoldersFilter },
                        hasMore: organisers.filters[defaultFoldersFilter].hasMore,
                        convos: Array.from(organisers.filters[defaultFoldersFilter].ids.convos, (peerId) => Convo.safeGet(convosCache, peerId)).sort((a, b) => Filters.sorter(a, b)),
                    };
                }
                else if (selectedOrganiser.mask !== actualMask) {
                    setSelectedOrganiser({
                        kind: 'tags',
                        filter: 'all',
                        mask: actualMask,
                    });
                }
                const tags = Tag.getSelectedTags(organisers.tags.items, actualMask);
                const peerIds = Tag.getPeerIdsIntersection(tags);
                const boundaryMinorId = Tag.getBoundaryMinorId(organisers.tags, selectedOrganiser.mask);
                convos = peerIds
                    .map((peerId) => Convo.safeGet(convosCache, peerId))
                    .sort((a, b) => Tag.sorter(a, b))
                    .filter((convo) => convo.minorSortId >= boundaryMinorId);
                return {
                    organiser: selectedOrganiser,
                    convos,
                    hasMore: Tag.hasMore(organisers.tags, selectedOrganiser.mask),
                };
            }
            default:
                exhaustivenessCheck(selectedOrganiser);
        }
    }, [
        disabled,
        selectedOrganiser,
        organisers.filters,
        organisers.folders,
        organisers.sublists,
        organisers.tags,
        convosCache,
        defaultFoldersFilter,
    ]);
    const peerIds = currentOrganiser.convos.map(({ peerId }) => peerId);
    const memoizedPeerIds = useMemoWithCustomCompare(() => peerIds, peerIds, isShallowEqual);
    return {
        selectedOrganiser: currentOrganiser.organiser,
        peerIds: memoizedPeerIds,
        hasMore: currentOrganiser.hasMore,
        setSelectedOrganiser,
    };
}
//# sourceMappingURL=useConvoOrganiser.js.map