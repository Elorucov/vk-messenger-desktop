import { COUNT_OF_FRIENDS_TO_LOAD } from '../../constants';
import { friendsSearch, getFriends } from '../../services/backend';
import { normalizeUser } from '../../helpers/user';
import { handlePromiseError } from '../../helpers/logger';
/**
 * @deprecated use FriendsService
 */
export function loadFriends() {
    return getFriends(COUNT_OF_FRIENDS_TO_LOAD)
        .then(({ items, count }) => {
        return { data: items.map(normalizeUser), count };
    })
        .catch(handlePromiseError);
}
/**
 * @deprecated use FriendsService
 */
export function loadMoreFriends(friendsCache, loadedPage = 1) {
    const offset = loadedPage * COUNT_OF_FRIENDS_TO_LOAD;
    return getFriends(COUNT_OF_FRIENDS_TO_LOAD, offset)
        .then(({ items, count }) => {
        const filteredFriends = [];
        if (items) {
            items.forEach((friend) => {
                if (!(friend.id in friendsCache)) {
                    filteredFriends.push(normalizeUser(friend));
                }
            });
        }
        return {
            data: filteredFriends,
            count,
        };
    })
        .catch(handlePromiseError);
}
/**
 * @deprecated use FriendsService
 */
export function searchFriends(vkId, q, friendsCache) {
    return friendsSearch(vkId, q)
        .then(({ items }) => {
        const filteredFriends = [];
        if (items) {
            items.forEach((friend) => {
                if (!(friend.id in friendsCache)) {
                    filteredFriends.push(normalizeUser(friend));
                }
            });
        }
        return {
            data: filteredFriends,
        };
    })
        .catch(handlePromiseError);
}
//# sourceMappingURL=friends.js.map