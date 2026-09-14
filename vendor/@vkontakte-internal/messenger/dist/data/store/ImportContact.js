import { insertContacts, insertPeers } from './State';
export const handler = (draft, action) => {
    insertPeers(draft, {
        apiUsers: action.profile ? [action.profile] : [],
        apiContacts: [action.contact],
        apiGroups: [],
    }, {
        dangerouslyOverwrite: true,
    });
    insertContacts(draft, [action.contact]);
    return [];
};
//# sourceMappingURL=ImportContact.js.map