import { useCallback } from 'react';
import * as Peer from '../../core/model/Peer';
import * as BotKeyboard from '../../core/model/BotKeyboard';
import { useBrowserEnv, useDispatch, useStoreState } from '../hooks/misc';
import { useRouter } from '../ui/Router/Router';
import { useApiFetch } from '../hooks/useApiFetch';
export const useBotKeyboard = ({ entrypoint, convo, authorPeer, onSend, }) => {
    const dispatch = useDispatch();
    const { screenRoute } = useRouter();
    const { analyticsAppName, analyticsOrigin, router } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const hiddenBotKeyboards = useStoreState('hiddenBotKeyboards');
    const hiddenKeyboardId = hiddenBotKeyboards.get(convo.peerId);
    const keyboardId = convo.currentKeyboard
        ? BotKeyboard.resolveKeyboardId(convo.currentKeyboard)
        : undefined;
    const isBotKeyboardHidden = hiddenKeyboardId &&
        (hiddenKeyboardId === BotKeyboard.BOT_KEYBOARD_DEFAULT_ID ||
            /**
             * Проверяем, что клавиатура поменялась,
             * иначе она без причины раскроется повторно.
             */
            hiddenKeyboardId === keyboardId);
    const isKeyboardOpened = !!convo.currentKeyboard && !isBotKeyboardHidden;
    const setKeyboardOpened = useCallback((state) => {
        /**
         * ME-33009 Изменяем стейт только при необходимости,
         * потому что dispatch вызывает ререндер всего приложения,
         * а setKeyboardOpened вызывается при вводе текста в композере,
         * что без проверки вызывало сильные лаги
         */
        if (state !== isKeyboardOpened) {
            dispatch({
                type: 'UserChangedConvo',
                peerId: convo.peerId,
                userAction: state ? 'show_bot_keyboard' : 'hide_bot_keyboard',
            });
        }
    }, [convo.peerId, dispatch, isKeyboardOpened]);
    const handleCallbackButtonClick = useCallback(async (payload, authorId, cmid) => {
        const eventId = await apiFetch('messages.sendMessageEvent', {
            peer_id: convo.peerId,
            payload: payload,
            author_id: authorId,
            cmid,
            from: analyticsAppName,
        });
        return BotKeyboard.resolveEventId(eventId);
    }, [analyticsAppName, apiFetch, convo.peerId]);
    const handleKeyboardSend = useCallback((action) => {
        const mention = getMention(convo.peerId, authorPeer);
        let text = '';
        if (action.type === 'text') {
            text = mention ? `@${mention} ${action.text}` : action.text;
        }
        dispatch({
            type: 'UserHitSend',
            entrypoint,
            text,
            attaches: {
                ...(action.type === 'location' && {
                    geo: {
                        kind: 'Geo',
                        coordinates: {
                            latitude: action.geo?.lat,
                            longitude: action.geo?.long,
                        },
                    },
                }),
            },
            timestamp: Date.now(),
            peerId: convo.peerId,
            extra: {
                botPayload: action.payload,
                ref: screenRoute.kind === 'ConvoRoute' ? screenRoute.ref : undefined,
                refSource: screenRoute.kind === 'ConvoRoute'
                    ? screenRoute.refSource
                    : undefined,
            },
            analyticsAppName,
            analyticsOrigin,
        });
        onSend?.();
        if (screenRoute.kind === 'ConvoRoute' &&
            (screenRoute.ref || screenRoute.refSource)) {
            router.replace({
                ...screenRoute,
                ref: undefined,
                refSource: undefined,
            });
        }
    }, [
        convo.peerId,
        screenRoute,
        router,
        authorPeer,
        dispatch,
        entrypoint,
        analyticsAppName,
        analyticsOrigin,
        onSend,
    ]);
    return {
        isKeyboardOpened,
        setKeyboardOpened,
        handleCallbackButtonClick,
        handleKeyboardSend,
    };
};
function getMention(peerId, authorPeer) {
    return Peer.isChatPeerId(peerId) && authorPeer?.kind === 'Group'
        ? authorPeer.screenName
        : '';
}
//# sourceMappingURL=useBotKeyboard.js.map