import React, { useState } from 'react';
import { Icon16Cancel, Icon28UnarchiveOutline } from '@vkontakte/icons';
import { FormattedLangKey } from '../../ui/FormattedLangKey/FormattedLangKey';
import cx from 'classnames';
import './ConvoListTopHint.css';
import { Link } from '../../ui/Link/Link';
import { useBrowserEnv } from '../../hooks/misc';
export const ConvoListTopHint = ({ title, icon, body, onClose, }) => {
    const { lang } = useBrowserEnv();
    const [state, setState] = useState('opened');
    const handleStartClosing = () => {
        if (state !== 'opened') {
            return;
        }
        setState('closing');
    };
    const handleClosed = () => {
        setState('closed');
        onClose();
    };
    return (React.createElement("div", { className: cx('ConvoList__topHintContainer', {
            'ConvoList__topHintContainer--closing': state === 'closing',
            'ConvoList__topHintContainer--closed': state === 'closed',
        }), onTransitionEnd: (event) => {
            event.stopPropagation();
            handleClosed();
        } },
        React.createElement("article", { className: "ConvoList__topHint" },
            icon && React.createElement("div", { className: "ConvoList__topHintIcon" }, icon),
            React.createElement("div", null,
                title && React.createElement("h3", { className: "ConvoList__topHintTitle" }, title),
                React.createElement("div", null, body)),
            React.createElement("button", { className: "ConvoList__topHintCloseButton", onTransitionEnd: (event) => {
                    // Событие всплывает
                    event.stopPropagation();
                }, onClick: handleStartClosing, "aria-label": lang.use('me_convo_list_top_hint_close_button_arialabel') },
                React.createElement(Icon16Cancel, null)))));
};
export function getTopHintProps(selectedOrganizer, lang, storage, settings, isEdu, isFeatureFlagsActive) {
    if (selectedOrganizer.kind === 'filters' &&
        selectedOrganizer.filter === 'messageRequest' &&
        !storage.get('message-requests-tab-top-hint-hidden')) {
        return {
            body: lang.use('me_message_request_tab_notice'),
            onClose: () => storage.set('message-requests-tab-top-hint-hidden', true),
        };
    }
    if (selectedOrganizer.kind === 'filters' &&
        selectedOrganizer.filter === 'archive' &&
        settings.autoUnarchive &&
        !storage.get('archive-tab-top-hint-hidden')) {
        return {
            title: lang.use('me_archive_tab_notice_title'),
            icon: React.createElement(Icon28UnarchiveOutline, null),
            body: (React.createElement(FormattedLangKey, { langkey: "me_archive_tab_notice_content", values: {
                    settingsLink: (buttonText) => (React.createElement(Link, { className: "ConvoList__topHintSettingsButton", to: {
                            kind: 'SettingsRoute',
                            section: 'main',
                        }, role: "button", tabIndex: 0 }, buttonText)),
                } })),
            onClose: () => storage.set('archive-tab-top-hint-hidden', true),
        };
    }
    if (selectedOrganizer.kind === 'channelFilters' &&
        selectedOrganizer.filter === 'archive' &&
        !storage.get('channels-archive-top-hint-hidden')) {
        return {
            title: !isEdu && isFeatureFlagsActive
                ? lang.use('me_channels_community_archive_tab_notice_title')
                : lang.use('me_channels_archive_tab_notice_title'),
            icon: React.createElement(Icon28UnarchiveOutline, null),
            body: !isEdu && isFeatureFlagsActive
                ? lang.use('me_channels_community_archive_tab_notice')
                : lang.use('me_channels_archive_tab_notice'),
            onClose: () => storage.set('channels-archive-top-hint-hidden', true),
        };
    }
    return null;
}
//# sourceMappingURL=ConvoListTopHint.js.map