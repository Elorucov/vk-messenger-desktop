import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2}]} */
import { useRef } from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
import { CallModal } from '../../../components/CallModal/CallModal';
import { MainContentWidget } from '../MainContentWidget/MainContentWidget';
import { FocusTrap, AppRootProvider, ColorSchemeProvider, Separator, Spacing, SplitCol, SplitLayout, } from '@vkontakte-internal/vkcom-kit';
import { HeaderRoomNameContainer } from '../HeaderWidget/HeaderRoomNameContainer';
import { HeaderWidget } from '../HeaderWidget/HeaderWidget';
import { FooterWidget } from '../FooterContainer/FooterContainer';
import { SausageContainer } from '../SausageContainer/SausageContainer';
import { useCollapseCall } from '../hooks';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getIsFullScreen } from '../../../selectors';
import { getVoiceRoomMainContainerWidth, getVoiceRoomNotification } from '../selectors';
import { NotificationContainer } from '../NotificationContainer/NotificationContainer';
import { getVoiceRoomModal } from '../selectors/simple/modal';
import { ModalManager } from '../modals';
import { CallSubtitlesWidget } from '../../callSubtitles/CallSubtitlesWidget';
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { Provider, useModel } from './VoiceRoomCallModel';
const VoiceRoomCallView = observer(function VoiceRoomCallView() {
    const { canFinishCall, canTransferAdminRights, leaveCall } = useModel();
    const isFullScreen = useTypedSelector(getIsFullScreen);
    const mainContainerWidth = useTypedSelector(getVoiceRoomMainContainerWidth);
    const notification = useTypedSelector(getVoiceRoomNotification);
    const modal = useTypedSelector(getVoiceRoomModal);
    const callRef = useRef(null);
    const toggleCollapseCall = useCollapseCall();
    return (_jsx(CallModal, { onClose: leaveCall, shouldConfirmClosing: !canTransferAdminRights && !canFinishCall, onBackdropClick: toggleCollapseCall, children: _jsx(FocusTrap, { hasFirstFocusableElement: true, autoFocus: true, children: _jsx(AppRootProvider, { children: _jsx(ColorSchemeProvider, { value: "dark", children: _jsxs("div", { ref: callRef, className: cx('CallsVoiceRoomCall', isFullScreen && 'CallsVoiceRoomCallFullScreen'), children: [_jsxs(SplitLayout, { children: [_jsx(SplitCol, { width: mainContainerWidth, children: _jsxs("div", { className: "CallsVoiceRoomCall__left-col-wrapper", children: [_jsx(HeaderRoomNameContainer, {}), _jsx(HeaderWidget, {}), _jsx(MainContentWidget, { wrapperRef: callRef }), _jsx(Separator, {}), _jsx(Spacing, { size: 8 }), _jsx(FooterWidget, {})] }) }), _jsx(SausageContainer, {})] }), notification && _jsx(NotificationContainer, {}), modal && _jsx(ModalManager, {}), _jsx(CallSubtitlesWidget, { isFullScreen: isFullScreen, isStub: true })] }) }) }) }) }));
});
export const VoiceRoomCallWidget = createWidget(Provider, VoiceRoomCallView);
//# sourceMappingURL=VoiceRoomCallWidget.js.map