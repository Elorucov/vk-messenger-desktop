import '../../ui/EmptyConvoList/EmptyConvoList.css';
import React, { useMemo } from 'react';
import cx from 'classnames';
import { Icon56ArchiveOutline, Icon56MessageReadOutline, Icon56MessagesOutline, } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { useCollapsibleContainer } from '../../ui/CollapsibleContainer/CollapsibleContainer';
export const EmptyConvoList = React.memo(function ({ organiser, onOrganiserChange, onOpenChatCreation, }) {
    const { lang } = useBrowserEnv();
    const { isOpen: isMainPanelOpen } = useCollapsibleContainer();
    const unreadPlaceholderText = useMemo(() => {
        if (!isMainPanelOpen) {
            return lang.use('me_convo_list_collapse_placeholder_unread');
        }
        const unreadPlaceholderSet = lang
            .use('me_convo_list_placeholder_unread_set')
            .split('|');
        return unreadPlaceholderSet[Math.floor(Math.random() * unreadPlaceholderSet.length)]?.trim();
    }, [lang, isMainPanelOpen]);
    let placeholder = null;
    switch (organiser.kind) {
        case 'filters':
            switch (organiser.filter) {
                case 'all':
                case 'chats':
                    placeholder = (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "EmptyConvoList__icon" },
                            React.createElement(Icon56MessagesOutline, null)),
                        React.createElement("div", null, isMainPanelOpen
                            ? lang.use('me_convo_list_placeholder_all')
                            : lang.use('me_convo_list_collapse_placeholder')),
                        !isMainPanelOpen && (React.createElement("button", { className: "EmptyConvoList__link", onClick: onOpenChatCreation }, lang.use('me_convo_list_collapse_placeholder_link')))));
                    break;
                case 'unread':
                    placeholder = (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "EmptyConvoList__icon" },
                            React.createElement(Icon56MessageReadOutline, null)),
                        React.createElement("div", null, unreadPlaceholderText),
                        isMainPanelOpen && (React.createElement("button", { className: "EmptyConvoList__link", onClick: () => {
                                onOrganiserChange({ kind: 'filters', filter: 'all' });
                            } }, lang.use('me_convo_list_placeholder_unread_link')))));
                    break;
                case 'archive':
                    placeholder = (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "EmptyConvoList__icon" },
                            React.createElement(Icon56ArchiveOutline, null)),
                        React.createElement("div", null, lang.use('me_convo_list_placeholder_archive'))));
                    break;
                case 'messageRequest':
                    placeholder = (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "EmptyConvoList__icon" },
                            React.createElement(Icon56MessagesOutline, null)),
                        React.createElement("div", null, lang.use('me_convo_list_placeholder_message_request'))));
                    break;
                case 'businessNotify':
                    placeholder = (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "EmptyConvoList__icon" },
                            React.createElement(Icon56MessagesOutline, null)),
                        React.createElement("div", null, lang.use('me_convo_list_placeholder_business_notify'))));
                    break;
                case 'adTag':
                case 'important':
                case 'unanswered':
                    placeholder = (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "EmptyConvoList__icon" },
                            React.createElement(Icon56MessagesOutline, null)),
                        React.createElement("div", null, lang.use('me_convo_list_placeholder_empty'))));
                    break;
                default:
                    return exhaustivenessCheck(organiser);
            }
            break;
        case 'folders':
            switch (organiser.filter) {
                case 'all':
                    placeholder = (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "EmptyConvoList__icon" },
                            React.createElement(Icon56MessagesOutline, null)),
                        React.createElement("div", null, lang.use(isMainPanelOpen
                            ? 'me_convo_list_placeholder_folder'
                            : 'me_convo_list_collapse_placeholder_folder'))));
                    break;
                case 'unread':
                    placeholder = (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "EmptyConvoList__icon" },
                            React.createElement(Icon56MessageReadOutline, null)),
                        React.createElement("div", null, unreadPlaceholderText),
                        isMainPanelOpen && (React.createElement("button", { className: "EmptyConvoList__link", onClick: () => {
                                onOrganiserChange({
                                    kind: 'folders',
                                    filter: 'all',
                                    id: organiser.id,
                                    type: organiser.type,
                                });
                            } }, lang.use('me_convo_list_placeholder_unread_link')))));
                    break;
                default:
                    return exhaustivenessCheck(organiser);
            }
            break;
        case 'tags':
            placeholder = (React.createElement(React.Fragment, null,
                React.createElement("div", { className: "EmptyConvoList__icon" },
                    React.createElement(Icon56MessagesOutline, null)),
                React.createElement("div", null, lang.use('me_convo_list_tags_placeholder_empty'))));
            break;
        default:
            return exhaustivenessCheck(organiser);
    }
    return (React.createElement("div", { className: cx('EmptyConvoList', {
            'EmptyConvoList--collapsed': !isMainPanelOpen,
        }) }, placeholder));
});
//# sourceMappingURL=EmptyConvoList.js.map