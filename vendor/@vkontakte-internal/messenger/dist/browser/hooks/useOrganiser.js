import * as Organisers from '../../core/model/Organisers';
import * as Folders from '../../core/model/Folder';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useConvoOrganiser } from '../hooks/useConvoOrganiser';
import { useChannelOrganiser } from '../hooks/useChannelOrganiser';
import { useRouter } from '../ui/Router/Router';
import * as Tag from '../../core/model/Tag';
const DEFAULT_CONVO_ORGANISER = {
    kind: 'filters',
    filter: 'all',
};
const DEFAULT_CHANNEL_ORGANISER = {
    kind: 'channelFilters',
    filter: 'all',
};
export function useOrganiser(state, onOrganiserChange) {
    const { screenRoute, navigate, router } = useRouter();
    const [initialOrganiser] = useState(() => {
        const organiser = getOrganiserFromRoute(screenRoute, state.organisers);
        if (!organiser) {
            return DEFAULT_CONVO_ORGANISER;
        }
        switch (organiser.kind) {
            case 'NotFoundInState':
                return {
                    kind: 'filters',
                    filter: organiser.filter,
                };
            case 'TagNotFoundInState':
                return {
                    kind: 'tags',
                    filter: 'all',
                    mask: organiser.mask,
                };
            default:
                return organiser;
        }
    });
    const [isChannelsOrganiserSelected, setChannelsOrganiserSelected] = useState(() => Organisers.isChannelFilter(initialOrganiser));
    const { setSelectedOrganiser: setSelectedConvoOrganiser, peerIds, hasMore: hasMoreConvos, selectedOrganiser: selectedConvoOrganiser, } = useConvoOrganiser(state.organisers, state.convos, Organisers.isChannelFilter(initialOrganiser)
        ? DEFAULT_CONVO_ORGANISER
        : initialOrganiser, 'all', isChannelsOrganiserSelected);
    const { setSelectedOrganiser: setSelectedChannelOrganiser, channelIds, hasMore: hasMoreChannels, selectedOrganiser: selectedChannelOrganiser, } = useChannelOrganiser(state.organisers, state.channels, Organisers.isChannelFilter(initialOrganiser)
        ? initialOrganiser
        : DEFAULT_CHANNEL_ORGANISER, !isChannelsOrganiserSelected);
    const memoizedChannelOrganiser = useMemo(() => ({
        kind: 'channels',
        item: selectedChannelOrganiser,
        channelIds,
        hasMore: hasMoreChannels,
    }), [channelIds, hasMoreChannels, selectedChannelOrganiser]);
    const memoizedConvoOrganiser = useMemo(() => ({
        kind: 'convos',
        item: selectedConvoOrganiser,
        peerIds,
        hasMore: hasMoreConvos,
    }), [peerIds, hasMoreConvos, selectedConvoOrganiser]);
    const selectedOrganiser = isChannelsOrganiserSelected
        ? memoizedChannelOrganiser
        : memoizedConvoOrganiser;
    const navigateToOrganiser = useCallback((item) => {
        navigate(getRouteForOrganiser(router.screenRoute, item));
    }, [navigate, router]);
    const setSelectedOrganiser = (organiser) => {
        switch (organiser.kind) {
            case 'NotFoundInState':
                return navigateToOrganiser({
                    kind: 'filters',
                    filter: organiser.filter,
                });
            case 'TagNotFoundInState':
                return navigateToOrganiser({
                    kind: 'tags',
                    filter: 'all',
                    mask: organiser.mask,
                });
            default:
                break;
        }
        const nextOrganiserId = Organisers.getId(organiser);
        const currentOrganiserId = Organisers.getId(selectedOrganiser.item);
        if (nextOrganiserId === currentOrganiserId) {
            return;
        }
        onOrganiserChange();
        setChannelsOrganiserSelected(Organisers.isChannelFilter(organiser));
        if (Organisers.isChannelFilter(organiser)) {
            return setSelectedChannelOrganiser(organiser);
        }
        return setSelectedConvoOrganiser(organiser);
    };
    useEffect(function syncSelectedOrganiserWithRoute() {
        const organiser = getOrganiserFromRoute(screenRoute, state.organisers);
        if (!organiser) {
            return;
        }
        setSelectedOrganiser(organiser);
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [screenRoute]);
    useEffect(function syncSelectedOrganiserWithState() {
        const organiser = getOrganiserFromRoute(screenRoute, state.organisers);
        switch (organiser?.kind) {
            case 'NotFoundInState':
            case 'TagNotFoundInState':
                setSelectedOrganiser(organiser);
                break;
            default:
                break;
        }
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.organisers]);
    return {
        setSelectedOrganiser: navigateToOrganiser,
        selectedOrganiser,
    };
}
const isOrganisersRoute = (route) => {
    return (route.kind === 'ConvoRoute' ||
        route.kind === 'MainRoute' ||
        route.kind === 'ChannelRoute');
};
export function getRouteForOrganiser(currentRoute, organiser) {
    // Этот блок обрабатывает исключительно роут папки каналов /im/channels
    // Так как этот роут сам по себе указатель на конкретный organiser, здесь не нужны параметры
    if (currentRoute.kind === 'ChannelsFolderRoute' &&
        organiser.kind === 'channelFilters' &&
        organiser.filter === 'all') {
        return currentRoute;
    }
    let newRoute;
    if (isOrganisersRoute(currentRoute)) {
        newRoute = currentRoute;
    }
    else {
        newRoute = {
            kind: 'MainRoute',
        };
    }
    if (organiser.kind === 'folders' && organiser.type === 'managed_groups') {
        newRoute = {
            kind: 'MainRoute',
        };
    }
    return {
        ...newRoute,
        organiser: organiser.kind === 'tags'
            ? {
                tags: organiser.mask,
            }
            : {
                filter: Organisers.filterToTab(organiser),
                folderId: organiser.kind === 'folders' ? organiser.id : undefined,
            },
    };
}
function getOrganiserFromRoute(currentRoute, organisers) {
    // Этот блок обрабатывает исключительно роут папки каналов /im/channels
    if (currentRoute.kind === 'ChannelsFolderRoute') {
        // В ChannelsFolderRoute (/im/channels) мы не используем поле organiser,
        // так как этот роут сам по себе указатель на конкретный organiser
        return Folders.hasChannelsFolder(organisers.folders)
            ? { kind: 'channelFilters', filter: 'all' }
            : { kind: 'NotFoundInState', filter: 'all' };
    }
    if (!('organiser' in currentRoute) || !currentRoute.organiser) {
        return null;
    }
    const { folderId, filter, tags } = currentRoute.organiser;
    if (folderId) {
        const currentFolder = organisers.folders.find((f) => f.id === folderId);
        const folderFilter = Organisers.tabToFolderFilter(filter);
        if (!currentFolder) {
            return {
                kind: 'NotFoundInState',
                filter: folderFilter,
            };
        }
        if (currentFolder.type === 'channels') {
            return {
                kind: 'channelFilters',
                filter: folderFilter,
            };
        }
        return {
            kind: 'folders',
            id: folderId,
            filter: folderFilter,
            type: currentFolder.type,
        };
    }
    if (Number.isInteger(tags)) {
        const actualMask = tags
            ? Tag.convertMask(organisers.tags.items, Tag.convertMask(organisers.tags.items, tags))
            : 0;
        if (!actualMask) {
            return { kind: 'NotFoundInState', filter: 'all' };
        }
        else if (tags !== actualMask) {
            return { kind: 'TagNotFoundInState', mask: actualMask };
        }
        return { kind: 'tags', filter: 'all', mask: tags };
    }
    const channelFilter = Organisers.tabToChannelFilter(filter);
    if (channelFilter) {
        return { kind: 'channelFilters', filter: channelFilter };
    }
    const convoFilter = Organisers.tabToConvoFilter(filter);
    if (convoFilter) {
        return { kind: 'filters', filter: convoFilter };
    }
    return null;
}
//# sourceMappingURL=useOrganiser.js.map