import { Icon20GameOutline, Icon20ServicesOutline, Icon24GameOutline, Icon24ServicesOutline, } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import { ComposerAttachCard, ComposerAttachCardIcon, } from '../../ui/ComposerAttachCard/ComposerAttachCard';
import * as Attach from '../../../core/model/Attach';
import React from 'react';
export const ComposerAttachMiniApp = ({ miniApp, isCompactView, }) => {
    const { lang } = useBrowserEnv();
    const Icon = getAttachIcon(miniApp, isCompactView);
    return (React.createElement(ComposerAttachCard, { icon: isCompactView ? React.createElement(Icon, null) : React.createElement(ComposerAttachCardIcon, { icon: React.createElement(Icon, null) }), main: Attach.isGame(miniApp)
            ? lang.use('me_composer_attach_game')
            : lang.use('me_composer_attach_mini_app'), secondary: miniApp.title }));
};
function getAttachIcon(miniApp, isCompactView) {
    const isGame = Attach.isGame(miniApp);
    if (isCompactView)
        return isGame ? Icon20GameOutline : Icon20ServicesOutline;
    return isGame ? Icon24GameOutline : Icon24ServicesOutline;
}
//# sourceMappingURL=ComposerAttachMiniApp.js.map