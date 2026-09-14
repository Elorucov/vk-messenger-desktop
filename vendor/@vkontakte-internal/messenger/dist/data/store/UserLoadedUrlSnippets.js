import { exhaustivenessCheck, sleep } from '../../core/utils/misc';
import { fromApiWallReplyAttach } from '../converter/AttachConverter';
import { insertPeers } from '../store/State';
import * as Attach from '../../core/model/Attach';
const THROTTLE_TIMEOUT = 300;
const URL_SNIPPETS_CACHE_SIZE = 30;
export const handler = (draft, action, featureFlags, envFeatureFlags) => {
    switch (action.type) {
        case 'UserLoadedUrlSnippets': {
            const { urls } = action;
            urls.forEach((url) => !draft.urlSnippetsCache.has(url) && draft.urlSnippetsQueue.add(url));
            if (draft.urlSnippetsQueue.size === 0) {
                return [];
            }
            if (draft.locks.urlSnippets.load || draft.locks.urlSnippets.throttle) {
                return [];
            }
            const urlsToFetch = Array.from(draft.urlSnippetsQueue);
            draft.urlSnippetsQueue = new Set();
            draft.locks.urlSnippets = {
                load: true,
                throttle: true,
            };
            return [
                async function fetchUrlSnippets({ api }) {
                    try {
                        const res = await api.fetch('wall.parseAttachedLink', {
                            links: JSON.stringify(urlsToFetch),
                            extended: 1,
                        });
                        return {
                            type: 'UserLoadedUrlSnippets_RequestCompleted',
                            urls: urlsToFetch,
                            res,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserLoadedUrlSnippets_RequestCompleted',
                            urls: urlsToFetch,
                        };
                    }
                },
                scheduleUrlsLoad(),
            ];
        }
        case 'UserLoadedUrlSnippets_ThrottleTimedOut': {
            draft.locks.urlSnippets.throttle = false;
            return !draft.locks.urlSnippets.load
                ? handler(draft, {
                    type: 'UserLoadedUrlSnippets',
                    urls: [],
                }, featureFlags, envFeatureFlags)
                : [];
        }
        case 'UserLoadedUrlSnippets_RequestCompleted': {
            const { res, urls } = action;
            draft.locks.urlSnippets.load = false;
            if (res) {
                const { data: apiAttaches, groups, profiles } = res;
                apiAttaches.forEach((apiAttach, index) => {
                    const attaches = fromApiWallReplyAttach([apiAttach]);
                    const attach = Object.values(attaches).map((item) => Array.isArray(item) ? item[0] : item)[0];
                    const attachUrl = urls[index];
                    if (!attach || !attachUrl || !Attach.isAddableAttach(attach)) {
                        return;
                    }
                    draft.urlSnippetsCache.set(attachUrl, attach);
                    if (draft.urlSnippetsCache.size >= 2 * URL_SNIPPETS_CACHE_SIZE) {
                        draft.urlSnippetsCache = new Map(Array.from(draft.urlSnippetsCache).slice(-URL_SNIPPETS_CACHE_SIZE));
                    }
                });
                insertPeers(draft, {
                    apiUsers: profiles || [],
                    apiGroups: groups || [],
                    apiContacts: [],
                });
            }
            return !draft.locks.urlSnippets.throttle
                ? handler(draft, {
                    type: 'UserLoadedUrlSnippets',
                    urls: [],
                }, featureFlags, envFeatureFlags)
                : [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
function scheduleUrlsLoad() {
    return async function scheduleSeenStatsSend() {
        await sleep(THROTTLE_TIMEOUT);
        return {
            type: 'UserLoadedUrlSnippets_ThrottleTimedOut',
        };
    };
}
//# sourceMappingURL=UserLoadedUrlSnippets.js.map