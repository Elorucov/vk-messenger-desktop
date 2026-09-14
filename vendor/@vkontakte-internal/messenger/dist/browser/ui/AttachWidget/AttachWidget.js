import '../../ui/AttachWidget/AttachWidget.css';
import React from 'react';
import { useBrowserEnv, useDispatch, useFeatureFlags, usePeers, } from '../../hooks/misc';
import { UniversalWidget } from '@superappkit/superappkit-widgets/dist';
import { ErrorBoundary } from 'react-error-boundary';
import * as Peer from '../../../core/model/Peer';
const AttachWidgetStub = () => {
    const { lang } = useBrowserEnv();
    return (React.createElement("div", { className: 'AttachWidgetStub' },
        React.createElement("span", null, lang.use('me_widget_not_available'))));
};
export const AttachWidget = ({ widget, peerId, entrypoint, }) => {
    const { lang, botKeyboard, analyticsAppName } = useBrowserEnv();
    const featureFlags = useFeatureFlags();
    const peers = usePeers();
    const dispatch = useDispatch();
    const widgetDoActionSendMessage = (actionPeerId, message, payload, notify) => {
        if (!entrypoint) {
            // если нет entrypoint значит пользователь открыл виджет не внутри беседы
            // пока решили просто скипать такие действия
            // в идеале такой случай невозможен (например в "Важных сообщениях" непонятно куда должен слать сообщения виджет и должен ли)
            return;
        }
        let recipientId = Peer.resolveId(actionPeerId);
        let text = message;
        /**
         * Если нажимаем на action send_message в виджете, который Маруся отправила в групповой чат,
         * то добавляем mention Маруси к тексту и отправляем сообщение в текущий чат.
         */
        if (!Peer.isMarusia(peerId) && Peer.isMarusia(recipientId)) {
            recipientId = peerId;
            text = MARUSIA_MENTION + ' ' + message;
        }
        dispatch({
            type: 'UserHitSendWidget',
            peerId: recipientId,
            entrypoint,
            text,
            timestamp: Date.now(),
            extra: {
                botPayload: payload,
            },
            analyticsAppName,
        });
        if (notify) {
            botKeyboard.openSnackbar?.({
                type: 'show_snackbar',
                title: '',
                text: lang.use('me_message_sent'),
            });
        }
    };
    const onAction = (action, meta) => {
        const peer = Peer.safeGet(peers, peerId);
        const name = Peer.name(peer);
        switch (action.type) {
            case 'open_url':
                botKeyboard.openLink(action.url, name, true);
                break;
            case 'open_mini_app':
            case 'open_game':
                let url = action.app_launch_params.webview_url || action.url;
                if (!url) {
                    const app = [...(meta.mini_apps ?? []), ...(meta.games ?? [])].find(({ id }) => id === action.app_launch_params.app_id);
                    url = app?.webview_url;
                }
                if (url) {
                    botKeyboard.openLink(url, name, true);
                }
                break;
            case 'send_message':
                widgetDoActionSendMessage(action.peer_id, action.message.text, action.message.payload, action.message.show_confirmation);
                break;
            default:
        }
    };
    if (!featureFlags.vkm_widget_attaches) {
        return React.createElement(AttachWidgetStub, null);
    }
    return (React.createElement(ErrorBoundary, { fallbackRender: () => React.createElement(AttachWidgetStub, null) },
        React.createElement(UniversalWidget
        // @ts-expect-error TS2698: Spread types may only be created from object types.
        , { ...widget.data, onAction: onAction })));
};
const MARUSIA_MENTION = '@marusia';
//# sourceMappingURL=AttachWidget.js.map