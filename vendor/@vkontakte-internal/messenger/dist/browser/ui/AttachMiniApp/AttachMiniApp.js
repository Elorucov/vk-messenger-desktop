import React from 'react';
import { Icon16Services, Icon16Game } from '@vkontakte/icons';
import { useBrowserEnv, usePixelDensity } from '../../hooks/misc';
import * as Attach from '../../../core/model/Attach';
import { AttachMiniAppCell, } from '../../ui/AttachMiniAppCell/AttachMiniAppCell';
export const AttachMiniApp = React.memo(function AttachMiniApp({ isCompact, isForwarded, isInBubble, isOut, isPrimary, isRich, miniApp, }) {
    const { lang } = useBrowserEnv();
    const isGame = Attach.isGame(miniApp);
    const isAvailable = Attach.isMiniAppAvailable(miniApp);
    const ButtonIcon = isGame ? Icon16Game : Icon16Services;
    return (React.createElement(AttachMiniAppCell, { route: {
            kind: 'AttachProxyRoute',
            attach: miniApp,
        }, isAvailable: isAvailable, isCompact: isCompact, isForwarded: isForwarded, isInBubble: isInBubble, isOut: isOut, isPrimary: isPrimary, isRich: isRich, imageSrc: useAppIconUrl(miniApp), imageAlt: lang.use('me_attaches_mini_app_alt'), subtitle: isGame
            ? lang.use('me_attaches_game_description')
            : lang.use('me_attaches_mini_app_description'), description: miniApp.description, buttonText: miniApp.buttonText ||
            (isGame
                ? lang.use('me_attaches_game_action')
                : lang.use('me_attaches_miniapp_action')), buttonIcon: React.createElement(ButtonIcon, null) }, miniApp.title));
});
export function useAppIconUrl(app) {
    const isDense = usePixelDensity();
    const [smallPreview, bigPreview] = app.images;
    return ((isDense ? bigPreview : smallPreview) || smallPreview).url;
}
//# sourceMappingURL=AttachMiniApp.js.map