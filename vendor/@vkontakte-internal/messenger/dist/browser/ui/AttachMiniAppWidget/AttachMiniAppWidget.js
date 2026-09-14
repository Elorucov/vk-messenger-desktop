import '../../ui/AttachMiniAppWidget/AttachMiniAppWidget.css';
import React, { useMemo } from 'react';
import cx from 'classnames';
import { Separator, UsersStack, Footnote } from '@vkontakte/vkui';
import { Icon16Services, Icon16Game } from '@vkontakte/icons';
import * as Attach from '../../../core/model/Attach';
import { useRouter } from '../../ui/Router/Router';
import { useBrowserEnv, useDispatch, useFeatureFlags } from '../../hooks/misc';
import { useMiniAppWidgetAppIconUrl } from '../../hooks/useMiniAppWidgetAppIconUrl';
import { MINI_APP_WIDGET_REFERER, useMiniAppWidgetActions, } from '../../hooks/useMiniAppWidgetActions';
import { AttachMiniAppCell, } from '../../ui/AttachMiniAppCell/AttachMiniAppCell';
export const AttachMiniAppWidget = React.memo(function AttachMiniAppWidget({ isCompact, isForwarded, isInBubble, isOut, isPrimary, isRich, miniAppWidget, }) {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const featureFlags = useFeatureFlags();
    const { screenRoute } = useRouter();
    const isGame = Attach.isGame(miniAppWidget);
    const { title, app, description, footer, cmid, buttonText: actionText, } = miniAppWidget;
    const { webviewUrl, id } = app;
    const appIconUrl = useMiniAppWidgetAppIconUrl(app);
    const { updateMiniAppWidgetFooter } = useMiniAppWidgetActions({ cmid });
    const route = useMemo(() => ({
        kind: 'MiniAppModal',
        miniAppId: Attach.resolveMiniAppId(id),
        referer: MINI_APP_WIDGET_REFERER,
        ...(featureFlags.vkm_webview_url ? { cmid } : {}),
        webviewUrl,
        entrypoint: screenRoute.kind === 'ConvoRoute'
            ? screenRoute.entrypoint
            : undefined,
    }), [id, featureFlags.vkm_webview_url, cmid, webviewUrl, screenRoute]);
    const buttonText = actionText ||
        (isGame
            ? lang.use('me_miniapp_widget_action_game')
            : lang.use('me_miniapp_widget_action_app'));
    const footerUsersAvatars = useMemo(() => footer?.items?.map(({ icon50 }) => icon50), [footer]);
    const hasFooterUsersAvatars = footerUsersAvatars?.length;
    const handleNavigate = () => {
        dispatch({
            type: 'MiniAppConfiguration',
            webviewUrl,
        });
        // Футер не отрисовывается в таком варианте, поэтому нет смысла его
        // обновлять.
        if (!isPrimary || !footer)
            return;
        void updateMiniAppWidgetFooter();
    };
    const ButtonIcon = isGame ? Icon16Game : Icon16Services;
    return (React.createElement(AttachMiniAppCell, { route: route, isCompact: isCompact, isForwarded: isForwarded, isInBubble: isInBubble, isOut: isOut, isPrimary: isPrimary, isRich: isRich, imageSrc: appIconUrl, imageAlt: lang.use('me_attaches_mini_app_alt'), onNavigate: handleNavigate, 
        // Для сервисов используем описание в кач-ве подзаголовка.
        subtitle: description, description: description, buttonText: buttonText, buttonIcon: React.createElement(ButtonIcon, null), after: footer && (React.createElement("div", { className: "AttachMiniAppWidget__footer" },
            React.createElement(Separator, null),
            React.createElement("div", { className: cx('AttachMiniAppWidget__footerContent', {
                    'AttachMiniAppWidget__footerContent--simple': !hasFooterUsersAvatars,
                }) }, hasFooterUsersAvatars ? (React.createElement(UsersStack, { size: "s", photos: footerUsersAvatars }, footer.description)) : (React.createElement(Footnote, null, footer.description))))) }, title));
});
//# sourceMappingURL=AttachMiniAppWidget.js.map