import React from 'react';
import { RichCell, Image, Tappable } from '@vkontakte/vkui';
import * as Peer from '../../../core/model/Peer';
import { useBrowserEnv, useDispatch, useFeatureFlags, useOwner, usePeers, } from '../../hooks/misc';
import cx from 'classnames';
import { ConvoAttachLinkActionsMenu } from '../../ui/ConvoAttachLinkActionsMenu/ConvoAttachLinkActionsMenu';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { Icon20More } from '@vkontakte/icons';
import { useMiniAppWidgetAppIconUrl } from '../../hooks/useMiniAppWidgetAppIconUrl';
import { MINI_APP_WIDGET_REFERER } from '../../hooks/useMiniAppWidgetActions';
import '../../ui/ConvoAttachesMiniAppWidgets/ConvoAttachesMiniAppWidgets.css';
import { isSameYear } from '../../../core/utils/misc';
import { Link } from '../../ui/Link/Link';
import { useMiniAppWidgetActions } from '../../hooks/useMiniAppWidgetActions';
import { useFastActionsState } from '../../hooks/useFastActionsState';
import { useNow } from '../../hooks/useNow';
import { UsersStack } from '../../ui/UsersStack/UsersStack';
import { useFastActionsTrigger } from '../../hooks/useFastActionsTrigger';
export const ConvoAttachesMiniAppWidgets = ({ miniAppWidgets, goToMessage }) => {
    const peers = usePeers();
    return (React.createElement("ul", { className: "ConvoAttachesMiniAppWidgets" }, miniAppWidgets.map((miniAppWidget) => {
        const { authorId } = miniAppWidget;
        const author = Peer.safeGet(peers, authorId);
        return (React.createElement(ConvoAttachesMiniAppWidgetsItem, { key: miniAppWidget.cmid, miniAppWidget: miniAppWidget, author: author, goToMessage: goToMessage }));
    })));
};
const ConvoAttachesMiniAppWidgetsItem = ({ miniAppWidget, author, goToMessage }) => {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const featureFlags = useFeatureFlags();
    const owner = useOwner();
    const { attach, cmid, date } = miniAppWidget;
    const { title, app, description } = attach;
    const appIconUrl = useMiniAppWidgetAppIconUrl(app);
    const formattedDate = useFormattedDate(date * 1000);
    const { updateMiniAppWidgetFooter } = useMiniAppWidgetActions({ cmid });
    const fastActionsTrigger = useFastActionsTrigger();
    const { isDropdownFastActionsOpened, openDropdownFastActions, closeDropdownFastActions, } = useFastActionsState();
    const { kind } = author;
    if (kind !== 'User') {
        return null;
    }
    const { photo, firstName, id } = author;
    const { id: miniAppId, webviewUrl } = app;
    const isMe = owner.id === id;
    const handleNavigate = () => {
        dispatch({
            type: 'MiniAppConfiguration',
            webviewUrl,
        });
        void updateMiniAppWidgetFooter();
    };
    const footerText = isMe
        ? lang.use('me_history_app_action_snippet_added_by_you')
        : firstName;
    return (React.createElement("li", { className: "ConvoAttachesMiniAppWidgets__itemWrapper" },
        React.createElement(Tappable, null,
            React.createElement(Link, { onNavigate: handleNavigate, to: {
                    kind: 'MiniAppModal',
                    miniAppId: miniAppId,
                    referer: MINI_APP_WIDGET_REFERER,
                    ...(featureFlags.vkm_webview_url ? { cmid } : {}),
                    webviewUrl,
                } },
                React.createElement("div", { className: "ConvoAttachesMiniAppWidgets__item" },
                    React.createElement("div", { className: "ConvoAttachesMiniAppWidgets__itemContent" },
                        React.createElement(RichCell, { before: React.createElement(Image, { size: 64, borderRadius: "m", src: appIconUrl }), className: "ConvoAttachesMiniAppWidgets__richCell", extraSubtitle: description, disabled: true, bottom: photo && (React.createElement(UsersStack, { size: 16, count: 1, photos: [photo] }, footerText + ' · ' + formattedDate)) }, title)),
                    fastActionsTrigger.button && (React.createElement(Dropdown, { open: isDropdownFastActionsOpened, onOpen: openDropdownFastActions, onClose: closeDropdownFastActions, classNames: {
                            wrapper: cx('ConvoAttachesMiniAppWidgets__dropdown', {
                                'ConvoAttachesMiniAppWidgets__dropdown--open': fastActionsTrigger.button === 'tap',
                            }),
                            wrapperOpened: 'ConvoAttachesMiniAppWidgets__dropdown--open',
                        }, content: React.createElement(ConvoAttachLinkActionsMenu, { cmid: cmid, goToMessage: goToMessage }), align: "center", position: "bottom", adaptive: true, hideOnClick: true, openType: fastActionsTrigger.button === 'tap' ? 'click' : 'hover' },
                        React.createElement("button", { className: "ConvoProfileAttachments__action", "aria-label": lang.use('me_actions_more') },
                            React.createElement(Icon20More, null),
                            fastActionsTrigger.button === 'tap' && (React.createElement("div", { className: "ConvoProfileAttachments__actionTapArea" }))))))))));
};
function useFormattedDate(timestamp) {
    const { lang } = useBrowserEnv();
    const now = useNow();
    return lang.use(isSameYear(now, timestamp) ? 'global_short_date' : 'global_date', {
        now,
        date: timestamp,
        shortMonths: true,
    });
}
//# sourceMappingURL=ConvoAttachesMiniAppWidgets.js.map