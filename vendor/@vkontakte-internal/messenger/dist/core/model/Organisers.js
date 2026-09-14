import { exhaustivenessCheck } from '../utils/misc';
import * as Filters from './Filters';
import * as Sublists from './Sublist';
import * as ChannelFilters from './ChannelFilters';
import * as Folders from './Folder';
import * as FoldersRecommended from './FolderRecommended';
import * as Tag from './Tag';
export function refresh(organisers, convo) {
    Sublists.refresh(organisers.sublists, convo);
    Filters.refresh(organisers.filters, convo);
    Tag.refresh(organisers.tags, convo);
}
export function refreshChannels(organisers, channel) {
    ChannelFilters.refresh(organisers.channelFilters, channel);
    Filters.refresh(organisers.filters, channel);
}
export function empty() {
    return {
        filters: Filters.empty(),
        folders: Folders.empty(),
        sublists: Sublists.empty(),
        recommendedFolders: FoldersRecommended.empty(),
        channelFilters: ChannelFilters.empty(),
        tags: Tag.empty(),
    };
}
export function isEqual(a, b) {
    a = convertToChannelFilter(a) ?? a;
    b = convertToChannelFilter(b) ?? b;
    if (a.kind !== b.kind) {
        return false;
    }
    switch (a.kind) {
        case 'filters':
        case 'channelFilters':
            return a.filter === b.filter;
        case 'folders':
            return a.id === b.id;
        case 'tags':
            return a.mask === b.mask;
        default:
            exhaustivenessCheck(a);
    }
}
export function canHavePinnedConvos(organizer) {
    return organizer.kind === 'filters';
}
export function getId(organizer) {
    switch (organizer.kind) {
        case 'folders':
            return `${organizer.kind}__${organizer.id}__${organizer.filter}`;
        case 'tags':
            return `${organizer.kind}__${organizer.mask}`;
        default:
            return `${organizer.kind}__${organizer.filter}`;
    }
}
export function isChannelFilter(organizer) {
    return organizer.kind === 'channelFilters';
}
export function convertToChannelFilter(organizer) {
    if (organizer.kind === 'channelFilters') {
        return organizer;
    }
    if (organizer.kind === 'folders' && organizer.type === 'channels') {
        return {
            kind: 'channelFilters',
            filter: organizer.filter,
        };
    }
    return null;
}
export function filterToTab(organiser) {
    switch (organiser.filter) {
        case 'all': {
            if (organiser.kind === 'channelFilters') {
                return 'allChannels';
            }
            return organiser.filter;
        }
        case 'archive': {
            if (organiser.kind === 'channelFilters') {
                return 'archiveChannels';
            }
            return organiser.filter;
        }
        case 'unread': {
            if (organiser.kind === 'channelFilters') {
                return 'unreadChannels';
            }
            return organiser.filter;
        }
        case 'adTag':
        case 'businessNotify':
        case 'important':
        case 'messageRequest':
        case 'chats':
        case 'unanswered':
            return organiser.filter;
        default:
            exhaustivenessCheck(organiser);
    }
}
export function tabToConvoFilter(tab) {
    switch (tab) {
        case 'adTag':
        case 'archive':
        case 'unread':
        case 'businessNotify':
        case 'important':
        case 'messageRequest':
        case 'all':
        case 'chats':
        case 'unanswered':
            return tab;
        default:
            return null;
    }
}
export function tabToFolderFilter(tab) {
    switch (tab) {
        case 'all':
        case 'unread':
            return tab;
        default:
            return 'all';
    }
}
export function tabToChannelFilter(tab) {
    switch (tab) {
        case 'allChannels':
            return 'all';
        case 'archiveChannels':
            return 'archive';
        case 'unreadChannels':
            return 'unread';
        default:
            return null;
    }
}
//# sourceMappingURL=Organisers.js.map