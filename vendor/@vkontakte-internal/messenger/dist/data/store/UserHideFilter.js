import * as Filters from '../../core/model/Filters';
import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserHideFilter':
            if (action.kind === 'businessNotify') {
                /**
                 * Если есть непрочитанные, то не скрываем
                 */
                if (draft.organisers.filters.businessNotify.unreadCount > 0) {
                    return [];
                }
                return [
                    async function hideBusinessNotify({ storage }) {
                        /** Запоминаем в storage, что бизнес-уведомления были скрыты вручную */
                        storage.set('business-notify-manually-hidden', true);
                        return {
                            type: 'UserHideFilter_Completed',
                            kind: 'businessNotify',
                        };
                    },
                ];
            }
            if (action.kind === 'adTag' ||
                action.kind === 'all' ||
                action.kind === 'unread' ||
                action.kind === 'chats' ||
                action.kind === 'important' ||
                action.kind === 'messageRequest' ||
                action.kind === 'archive' ||
                action.kind === 'unanswered') {
                return [];
            }
            return exhaustivenessCheck(action.kind);
        case 'UserHideFilter_Completed':
            if (action.kind === 'businessNotify') {
                Filters.toggleBusinessNotifyVisibility(draft.organisers.filters, false);
                return [];
            }
            if (action.kind === 'adTag' ||
                action.kind === 'all' ||
                action.kind === 'unread' ||
                action.kind === 'chats' ||
                action.kind === 'important' ||
                action.kind === 'messageRequest' ||
                action.kind === 'archive' ||
                action.kind === 'unanswered') {
                return [];
            }
            return exhaustivenessCheck(action.kind);
        case 'UserUndoHideFilter':
            if (action.kind === 'businessNotify') {
                Filters.toggleBusinessNotifyVisibility(draft.organisers.filters, true);
                return [
                    async function ({ storage }) {
                        storage.set('business-notify-manually-hidden', false);
                        return {
                            type: 'Noop',
                        };
                    },
                ];
            }
            if (action.kind === 'adTag' ||
                action.kind === 'all' ||
                action.kind === 'unread' ||
                action.kind === 'chats' ||
                action.kind === 'important' ||
                action.kind === 'messageRequest' ||
                action.kind === 'archive' ||
                action.kind === 'unanswered') {
                return [];
            }
            return exhaustivenessCheck(action.kind);
        case 'UserActualizeHideFilter':
            if (action.kind === 'businessNotify') {
                const unreadCount = draft.organisers.filters.businessNotify.unreadCount;
                const { isHidden } = draft.organisers.filters.businessNotify;
                return [
                    async function ({ storage }) {
                        const isHiddenStorageValue = storage.get('business-notify-manually-hidden');
                        if (isHiddenStorageValue && !isHidden) {
                            return {
                                type: 'UserHideFilter',
                                kind: 'businessNotify',
                            };
                        }
                        if (!isHiddenStorageValue && isHidden) {
                            return {
                                type: 'UserUndoHideFilter',
                                kind: 'businessNotify',
                            };
                        }
                        if (unreadCount === 0) {
                            return {
                                type: 'Noop',
                            };
                        }
                        return {
                            type: 'UserUndoHideFilter',
                            kind: 'businessNotify',
                        };
                    },
                ];
            }
            if (action.kind === 'adTag' ||
                action.kind === 'all' ||
                action.kind === 'unread' ||
                action.kind === 'chats' ||
                action.kind === 'important' ||
                action.kind === 'messageRequest' ||
                action.kind === 'archive' ||
                action.kind === 'unanswered') {
                return [];
            }
            return exhaustivenessCheck(action.kind);
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=UserHideFilter.js.map