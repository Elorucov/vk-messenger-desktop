import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { classNames as cx } from '@vkontakte/vkjs';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getIsVoiceRoomTribuneMode } from '../selectors';
import { PinnedParticipantWidget } from '../PinnedParticipantWidget/PinnedParticipantWidget';
import { MainContentMode } from '../types';
import { MoviePlayerWidget } from '../MoviePlayerWidget';
import { ScreenShareContainer } from '../ScreenShareContainer';
import { CallReactionsColumn } from '../../../components/CallReactionsColumn/CallReactionsColumn';
import { GridSpeakersWidget } from '../GridSpeakersWidget/GridSpeakersWidget';
import { getIsFullScreen } from '../../../selectors';
import { useModel, Provider } from './MainContentModel';
import { createWidget } from '@vkontakte-internal/di';
export function MainContentView() {
    const { contentMode, props } = useModel();
    const isFullScreen = useTypedSelector(getIsFullScreen);
    const isTribune = useTypedSelector(getIsVoiceRoomTribuneMode);
    return (_jsxs("div", { className: cx('CallsVoiceRoomCall__contentWrapper', isFullScreen && 'CallsVoiceRoomCall__contentWrapper--fullScreen'), children: [contentMode === MainContentMode.PIN && _jsx(PinnedParticipantWidget, {}), contentMode === MainContentMode.SCREEN_SHARE && _jsx(ScreenShareContainer, {}), contentMode === MainContentMode.MOVIE_PLAYER && _jsx(MoviePlayerWidget, {}), contentMode === MainContentMode.GRID && _jsx(GridSpeakersWidget, {}), _jsx(CallReactionsColumn, { isGridView: false, isShownParticipantsAside: false, refCall: props.current.wrapperRef, className: "VoiceRoom__reactions", showReactionWithoutUserName: isTribune })] }));
}
export const MainContentWidget = createWidget(Provider, MainContentView);
//# sourceMappingURL=MainContentWidget.js.map