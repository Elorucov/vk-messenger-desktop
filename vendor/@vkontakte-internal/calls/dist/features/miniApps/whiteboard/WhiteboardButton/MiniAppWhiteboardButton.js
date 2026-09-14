import { jsx as _jsx } from "react/jsx-runtime";
import { WhiteboardIconButton } from './WhiteboardIconButton';
import { createWidget } from '@vkontakte-internal/di';
import { Provider, useModel } from './WhiteboardModel';
import { observer } from 'mobx-react-lite';
const MiniAppWhiteboardButton = observer(() => {
    const { isAppSharedFromMyDevice, isAppSharedByAnother, tooltip, handleWhiteBoardToggle, config } = useModel();
    return !config.sferum || !config.enableWhiteboardInNewTabSferum ? (_jsx(WhiteboardIconButton, { active: isAppSharedFromMyDevice, disabled: isAppSharedByAnother, onClick: !isAppSharedByAnother ? handleWhiteBoardToggle : undefined, tooltip: tooltip })) : (_jsx(WhiteboardIconButton, { href: config.sferumWhiteboardMinappUrl, tooltip: tooltip }));
});
export const MiniAppWhiteboardButtonWidget = createWidget(Provider, MiniAppWhiteboardButton);
//# sourceMappingURL=MiniAppWhiteboardButton.js.map