import '../../ui/EmptyChannelsList/EmptyChannelsList.css';
import React from 'react';
import { Icon56ArchiveOutline, Icon56MessageReadOutline, Icon56MessagesOutline, } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { useCollapsibleContainer } from '../../ui/CollapsibleContainer/CollapsibleContainer';
import { classNames as cx } from '@vkontakte/vkjs';
export const EmptyChannelsList = React.memo(function ({ organiser }) {
    const { lang } = useBrowserEnv();
    const { isOpen: isMainPanelOpen } = useCollapsibleContainer();
    let placeholder = null;
    switch (organiser.kind) {
        case 'channelFilters':
            switch (organiser.filter) {
                case 'all':
                    placeholder = (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "EmptyChannelsList__icon" },
                            React.createElement(Icon56MessagesOutline, null)),
                        React.createElement("div", null, lang.use(isMainPanelOpen
                            ? 'me_channels_list_placeholder_all'
                            : 'me_channels_list_placeholder_all_collapsed'))));
                    break;
                case 'unread':
                    placeholder = (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "EmptyChannelsList__icon" },
                            React.createElement(Icon56MessageReadOutline, null)),
                        React.createElement("div", null, lang.use(isMainPanelOpen
                            ? 'me_channels_list_placeholder_unread'
                            : 'me_channels_list_placeholder_unread_collapsed'))));
                    break;
                case 'archive':
                    placeholder = (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "EmptyChannelsList__icon" },
                            React.createElement(Icon56ArchiveOutline, null)),
                        React.createElement("div", null, lang.use('me_channels_list_placeholder_archive'))));
                    break;
                default:
                    return exhaustivenessCheck(organiser.filter);
            }
            break;
        default:
            return exhaustivenessCheck(organiser.kind);
    }
    return (React.createElement("div", { className: cx('EmptyChannelsList', {
            'EmptyChannelsList--collapsed': !isMainPanelOpen,
        }) }, placeholder));
});
//# sourceMappingURL=EmptyChannelsList.js.map