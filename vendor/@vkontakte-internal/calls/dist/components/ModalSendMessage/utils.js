const DEFAULT_TITLE = '';
export const noop = () => { };
const getProfilePhoto = (profiles, id) => {
    const userDetails = Array.isArray(profiles) ? profiles.find((profile) => profile.id === id) : profiles;
    if (!userDetails) {
        return;
    }
    return userDetails.photo_50;
};
const getConversationPhoto = (item, profiles) => {
    switch (item.conversation.peer.type) {
        case 'chat':
            return item.conversation.chat_settings?.photo?.photo_50;
        case 'user': {
            return getProfilePhoto(profiles, item.conversation.peer.id);
        }
        default:
            return;
    }
};
const getProfileTitle = (profiles, id) => {
    const userDetails = Array.isArray(profiles) ? profiles.find((profile) => profile.id === id) : profiles;
    if (!userDetails || !userDetails.first_name) {
        return DEFAULT_TITLE;
    }
    let title = userDetails.first_name;
    if (userDetails.last_name) {
        title += ' ' + userDetails.last_name;
    }
    return title;
};
const getConversationTitle = (item, profiles) => {
    switch (item.conversation.peer.type) {
        case 'chat':
            return item.conversation.chat_settings?.title || DEFAULT_TITLE;
        case 'user': {
            return getProfileTitle(profiles, item.conversation.peer.id);
        }
        default:
            return DEFAULT_TITLE;
    }
};
/** маппер для "бесед", которые возвращаются со списка бесед (`messages.getConversations`) */
export const mapConversations = (items, profiles = []) => {
    const result = [];
    for (const item of items) {
        if (item.conversation.peer.type !== 'chat') {
            continue;
        }
        result.push({
            value: item.conversation.peer.id.toString(),
            src: getConversationPhoto(item, profiles),
            label: getConversationTitle(item, profiles),
        });
    }
    return result;
};
export const mapUserProfiles = (profiles = []) => {
    return profiles.map((user) => ({
        value: user.id.toString(),
        src: getProfilePhoto(user, user.id),
        label: getProfileTitle(user, user.id),
    }));
};
/** маппер для "бесед", которые возвращаются через поиск (`messages.search`) */
export const mapMessageConversation = (items) => {
    return items.map((item) => ({
        value: item.peer.id.toString(),
        src: item.chat_settings?.photo?.photo_50,
        label: item.chat_settings?.title || DEFAULT_TITLE,
    }));
};
//# sourceMappingURL=utils.js.map