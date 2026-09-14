import { exhaustivenessCheck } from '../../core/utils/misc';
import { insertContactItems, insertContacts } from '../store/State';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'LoadContactList': {
            if (draft.locks.contactList) {
                return [];
            }
            draft.locks.contactList = true;
            return [
                async function loadContactList({ api }) {
                    try {
                        const response = await api.fetch('account.getContactList', {
                            extended: 1,
                            offset: action.offset,
                        }, { retries: 1 });
                        return {
                            type: 'LoadContactList_RequestCompleted',
                            contacts: response.contacts || [],
                            profiles: response.profiles || [],
                            items: response.items || [],
                        };
                    }
                    catch (err) {
                        return {
                            type: 'LoadContactList_RequestCompleted',
                            contacts: [],
                            profiles: [],
                            items: [],
                        };
                    }
                },
            ];
        }
        case 'LoadContactList_RequestCompleted': {
            draft.locks.contactList = false;
            insertContacts(draft, action.contacts);
            insertContactItems(draft, action.items, action.profiles);
            draft.contacts.hasMore = false;
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=LoadContactList.js.map