import { VIEWER_DEFAULT_PUSH_SETTINGS, } from '../../core/model/Viewer';
export function fromApiViewerPushSettings(notificationsSettings) {
    let result = VIEWER_DEFAULT_PUSH_SETTINGS;
    const messages = Array.isArray(notificationsSettings.items)
        ? notificationsSettings.items?.find((item) => item.id === 'messages')?.items
        : notificationsSettings.items && [notificationsSettings.items];
    if (messages === undefined) {
        return result;
    }
    const getEnabledSetting = (section) => {
        return section && 'settings' in section
            ? section.settings.find((setting) => setting.is_enabled)?.id
            : undefined;
    };
    const getConvoKindSettings = (settings, sectionId) => {
        const userConvo = messages.find((item) => item.id === sectionId);
        if (userConvo && 'push_value' in userConvo) {
            settings = { ...settings, isEnabled: userConvo.push_value === 'on' };
        }
        const withMessageTextMapper = {
            text: true,
            no_text: false,
        };
        const userWithText = getEnabledSetting(userConvo);
        if (userWithText) {
            settings = {
                ...settings,
                withMessageText: withMessageTextMapper[userWithText] ?? settings.withMessageText,
            };
        }
    };
    getConvoKindSettings(result.userConvo, 'private_messages');
    getConvoKindSettings(result.chatConvo, 'group_chats');
    getConvoKindSettings(result.groupConvo, 'groups_messages_pushes');
    getConvoKindSettings(result.messageReaction, 'group_message_reaction');
    const mention = messages.find((item) => item.id === 'mail');
    const mentionModeMapper = {
        all: 'every-mention',
        important: 'direct-mention',
        none: 'nothing',
    };
    const mentionMode = getEnabledSetting(mention);
    if (mentionMode) {
        result = {
            ...result,
            mention: mentionModeMapper[mentionMode] ?? result.mention,
        };
    }
    return result;
}
//# sourceMappingURL=SettingsConverter.js.map