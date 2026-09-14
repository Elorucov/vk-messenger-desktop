import React, { useEffect, useLayoutEffect } from 'react';
import * as Convo from '../../../core/model/Convo';
import { useActiveConvoTopPlayerType, } from '../../ui/ConvoTopPlayer/ConvoTopPlayer';
import { useConvoRoute, useRouter } from '../../ui/Router/Router';
import { Spinner } from '@vkontakte/vkui';
import { Icon28ErrorCircleOutline } from '@vkontakte/icons';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useBrowserEnv, useDispatch, useFeatureFlags } from '../../hooks/misc';
export const ConvoMainWrapper = ({ dispatch, convos, children }) => {
    const route = useConvoRoute();
    const convo = convos.get(route.peerId);
    const { vkm_delete_chat } = useFeatureFlags();
    const { lang } = useBrowserEnv();
    const { navigate, replace } = useRouter();
    const snackbar = useSnackbar();
    useEffect(() => {
        if (route.peerId === 0) {
            navigate({
                kind: 'MainRoute',
            });
            return;
        }
        dispatch({
            type: 'UserOpenedConvo',
            peerId: route.peerId,
        });
        return () => {
            dispatch({
                type: 'UserClosedConvo',
                peerId: route.peerId,
            });
        };
        // Не вызываем экшены открытия / закрытия чата при изменении navigate.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, route.peerId]);
    useLoadUpdatePostponedHistory(convo);
    const topPlayerType = useActiveConvoTopPlayerType(convo);
    /**
     * Не даем открывать удаленные чаты
     *
     * В случае когда пользователь переходит по ссылке на удаленный чат, они технически доступны для загрузки, и признак
     * что чат удален это лишь признак в самой модели чата. Поэтому штатно загружаем чат, и если он "удален", редиректим
     * пользователя в корень приложения с соответствущим уведомлением
     *
     * И чтобы не создавать визуальных артефактов (моргание в UI от отображения чата на 1-2 мс), показываем лоадер пока
     * отрабатывает эффект редиректа в корень приложения
     *
     * @see https://jira.mvk.com/browse/ME-42312
     */
    useEffect(() => {
        if (!vkm_delete_chat) {
            return;
        }
        if (!convo || !Convo.isDeleted(convo)) {
            return;
        }
        replace({ kind: 'MainRoute' });
        snackbar({
            mode: 'dark',
            message: lang.use('me_chat_deleted_notification'),
            before: (React.createElement(Icon28ErrorCircleOutline, { fill: "var(--vkui--color_icon_negative)" })),
        });
    }, [vkm_delete_chat, convo, replace, snackbar, lang]);
    const isLoading = !convo;
    const showSpinner = isLoading || Convo.isDeleted(convo);
    // Показываем спиннер пока нет convo или не была сделана проверка на route.cmid
    return showSpinner ? (React.createElement("div", { className: "MEApp__convoSpinner" },
        React.createElement(Spinner, { size: "m" }))) : (children({
        convo,
        peerId: route.peerId,
        entrypoint: route.entrypoint,
        topPlayerType,
    }));
};
function useLoadUpdatePostponedHistory(convo) {
    const { envFeatureFlags } = useBrowserEnv();
    const { screenRoute } = useRouter();
    const dispatch = useDispatch();
    const isPostponedLoaded = convo?.postponed.loaded;
    const peerId = convo?.peerId;
    const isPostponedMessagesAvailable = envFeatureFlags.isPostponedMessagesAvailable;
    const isPostponedScreen = screenRoute.kind === 'ConvoRoute' && screenRoute.postponed;
    const shouldLoad = isPostponedMessagesAvailable && isPostponedScreen && !isPostponedLoaded;
    useLayoutEffect(() => {
        if (peerId && shouldLoad) {
            dispatch({
                type: 'UserOpenedPostponedMessagesHistory',
                peerId,
            });
        }
    }, [dispatch, peerId, shouldLoad]);
}
//# sourceMappingURL=ConvoMainWrapper.js.map