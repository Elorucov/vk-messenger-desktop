import React from 'react';
import { Header, Group, Footer } from '@vkontakte/vkui';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import { ATTACH_PICKER_REFERER } from '../../ui/MiniAppPicker/MiniAppPicker';
import { MiniAppPickerItem } from '../../ui/MiniAppPickerItem/MiniAppPickerItem';
import { Link } from '../../ui/Link/Link';
import * as Attach from '../../../core/model/Attach';
export const MiniAppPickerGroup = ({ items, type, onClose, count, onSendApp, withFooter = true, withSeparator = false, isCompact, peerId, }) => {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    return (React.createElement(React.Fragment, null,
        React.createElement(Group, { mode: "plain", separator: withSeparator ? 'show' : 'hide', header: React.createElement(Header, { size: "s" }, type === 'widgets'
                ? lang.use('me_miniapps_picker_send_title')
                : lang.use('me_miniapps_picker_open_title')) }, items.map(({ actionTitle, actionHash, app }) => {
            if (!app) {
                return null;
            }
            const { id, title, icon75, icon150, webviewUrl } = app;
            const handleNavigate = () => {
                dispatch({
                    type: 'MiniAppConfiguration',
                    webviewUrl,
                });
                onClose();
            };
            return (React.createElement(Link, { key: id, to: {
                    kind: 'MiniAppModal',
                    miniAppId: Attach.resolveMiniAppId(id),
                    hash: actionHash,
                    referer: ATTACH_PICKER_REFERER,
                    webviewUrl: webviewUrl,
                    fromPeerId: peerId,
                }, disabled: type !== 'apps', className: "MiniAppPicker__link", onNavigate: handleNavigate },
                React.createElement(MiniAppPickerItem, { id: id, action: actionTitle, title: title, smallIcon: icon75, bigIcon: icon150, type: type, onSendApp: onSendApp, isCompact: isCompact })));
        })),
        withFooter && (React.createElement(Footer, null, lang.use('me_miniapps_picker_count', { num: count })))));
};
//# sourceMappingURL=MiniAppPickerGroup.js.map