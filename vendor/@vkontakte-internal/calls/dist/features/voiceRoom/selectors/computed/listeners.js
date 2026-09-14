import { LISTENERS_PAGE_SIZE } from '../../constants';
import { getVoiceRoomListenersPages, getVoiceRoomListenersPage, getVoiceRoomListenersTotalCount, } from '../simple';
export const getVoiceRoomListenersMaxPage = (state) => {
    const totalCount = getVoiceRoomListenersTotalCount(state);
    return Math.max(Math.ceil(totalCount / LISTENERS_PAGE_SIZE) - 1, 0);
};
export const getVoiceRoomListenersPagesList = (state) => {
    const page = getVoiceRoomListenersPage(state);
    const pages = getVoiceRoomListenersPages(state);
    const maxPage = getVoiceRoomListenersMaxPage(state);
    const prevPage = page > 0 ? page - 1 : null;
    const calcNextPage = page + 1;
    const nextPage = calcNextPage <= maxPage ? calcNextPage : null;
    const result = { [page]: Object.values(pages[page] || []) };
    if (typeof prevPage === 'number') {
        result[prevPage] = Object.values(pages[prevPage] || []);
    }
    if (typeof nextPage === 'number') {
        result[nextPage] = Object.values(pages[nextPage] || []);
    }
    return result;
};
//# sourceMappingURL=listeners.js.map