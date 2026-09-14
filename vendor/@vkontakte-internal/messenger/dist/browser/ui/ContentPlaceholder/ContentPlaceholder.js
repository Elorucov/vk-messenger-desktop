import '../../ui/ContentPlaceholder/ContentPlaceholder.css';
import React, { useMemo } from 'react';
import classnames from 'classnames';
import { useBrowserEnv, useCommunityMessaging } from '../../hooks/misc';
import { Icon56MessagesOutline, Icon28ArrowUpRightOutSquareOutline, Icon56ArticleOutline, } from '@vkontakte/icons';
import { FormattedLangKey } from '../../ui/FormattedLangKey/FormattedLangKey';
export const ContentPlaceholder = ({ type = 'convo', onOpenChatCreation, }) => {
    const { lang } = useBrowserEnv();
    const isCommunityMessaging = useCommunityMessaging();
    const content = useMemo(() => {
        switch (type) {
            case 'convo': {
                return (React.createElement(React.Fragment, null,
                    React.createElement(Icon56MessagesOutline, { className: "ContentPlaceholder__convoPlaceholderIcon" }),
                    isCommunityMessaging ? (lang.use('me_open_community_chat_placeholder')) : (React.createElement(FormattedLangKey, { langkey: "me_choose_chat_or_create_new", values: {
                            createChatButton: (text) => (React.createElement("button", { className: "ContentPlaceholder__convoPlaceholderButton", onClick: onOpenChatCreation }, text)),
                        } }))));
            }
            case 'channel': {
                return (React.createElement(React.Fragment, null,
                    React.createElement(Icon56ArticleOutline, { className: "ContentPlaceholder__convoPlaceholderIcon" }),
                    lang.use('me_placeholder_channel')));
            }
            case 'managedGroup': {
                return (React.createElement(React.Fragment, null,
                    React.createElement(Icon28ArrowUpRightOutSquareOutline, { className: "ContentPlaceholder__managedGroupPlaceholderIcon" }),
                    React.createElement("span", { className: "ContentPlaceholder__managedGroupPlaceholderText" }, lang.use('me_choose_managed_group_text'))));
            }
            default:
                return null;
        }
    }, [lang, type, onOpenChatCreation, isCommunityMessaging]);
    return (React.createElement("div", { className: classnames('ContentPlaceholder', `ContentPlaceholder--${type}`) }, content));
};
export function getPlaceholderType(organiser) {
    if (organiser.kind === 'folders') {
        switch (organiser.type) {
            case 'managed_groups':
                return 'managedGroup';
            case 'channels':
                return 'channel';
            default:
                break;
        }
    }
    if (organiser.kind === 'channelFilters') {
        return 'channel';
    }
    return 'convo';
}
//# sourceMappingURL=ContentPlaceholder.js.map