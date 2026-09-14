import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"article":["global",{"className":1}],"main":["global",{"className":1}],"Overlay":["@vkontakte-internal/vkcom-kit",{"className":1}],"button":["global",{"className":1}],"Icon16Chevron":["@vkontakte/icons",{"className":1}],"Icon16ChevronLeft":["@vkontakte/icons",{"className":1}],"aside":["global",{"className":1}],"ul":["global",{"className":1,"style":1}],"li":["global",{"className":1,"style":1}]} */
import { useMemo } from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
import { isSharedMiniAppShownFromDevice } from '@vkontakte-internal/calls-core';
import { Icon16Chevron, Icon16ChevronLeft } from '@vkontakte/icons';
import { CallOratorMainWidget } from './OratorMain';
import { getAvailableStreamModes } from '../../helpers/participant';
import { OratorTitle } from '../OratorTitle/OratorTitle';
import { SAUSAGE_PARTICIPANT_HEIGHT, SAUSAGE_PARTICIPANT_MARGIN, PARTICIPANTS_LIST_ORATOR_BOTTOM_OFFSET, } from './constants';
import { useCallNotifications } from '../../hooks/useCallNotifications';
import { useLang } from '../../hooks/useLang';
import { CallSubtitles } from '../../features/callSubtitles';
import { AppearanceProvider, StreamModeSwitcher, Overlay, Flex, Div } from '@vkontakte-internal/vkcom-kit';
import { getStreamModeIcon, getStreamModeLabel } from '../../utils/streamMode';
import { createWidget } from '@vkontakte-internal/di';
import { Provider, useModel } from './CallOratorModel';
import { observer } from 'mobx-react-lite';
// Контейнер для отображения режима оратора
// Отвечает за рендер самого Оратора, колбасы с участниками, и прочих элементов относящихся к режиму оратора
const CallOrator = observer(({ children }) => {
    const { props, setStreamMode } = useModel();
    const { onToggleParticipantsAside, isShownParticipantsAside, participantsAsideCount, firstRenderedParticipantIndex, isFullScreen, onStopScreenShare, orator, handleShowCallControls, watchTogetherMovieState, localExternalId, me, groupId, meGroup, isPinned, isPinnedByAdmin, isPinnedByMedia, isUnpinAllowed, isSubtitlesEnabled, onUnpin, onFullScreenToggle, isServerTopology, isOratorOnly, containerRef, } = props;
    const { getLang } = useLang();
    const { device } = orator;
    const streamSwitcherModes = useMemo(() => {
        return getAvailableStreamModes(device).map((mode) => ({
            value: mode,
            title: getStreamModeLabel(mode, getLang),
            icon: getStreamModeIcon(mode),
        }));
    }, [device]);
    const isSharedUrlShown = isSharedMiniAppShownFromDevice(device);
    const classesToggleIcon = cx('CallOrator__toggleIcon', 'CallOrator__toggleIcon--withAnimation');
    const classes = cx('CallOrator', {
        'CallOrator--withoutOthers': isOratorOnly || !isShownParticipantsAside,
    });
    const othersClasses = cx('CallOrator__others', {
        'CallOrator__others--hide': isOratorOnly || !isShownParticipantsAside,
    });
    const oratorClasses = cx('CallOrator__orator', {
        'CallOrator__orator--fullScreen': isFullScreen,
        'CallOrator__orator--subtitles': isSubtitlesEnabled,
    });
    const toggleOthersClasses = cx('CallOrator__toggleOthers', {
        'CallOrator__toggleOthers--hide': isOratorOnly,
        'CallOrator__orator--fullScreen': isFullScreen,
    });
    // Т.к. в моменте рисуется не весь список participants, а его часть, мы рассчитываем число проскроленных participants
    // и на основе этого получаем высоту, которую необходимо заполнить для корректного скролла
    const participantsAsideShift = firstRenderedParticipantIndex === 0
        ? 0
        : firstRenderedParticipantIndex * (SAUSAGE_PARTICIPANT_HEIGHT + SAUSAGE_PARTICIPANT_MARGIN) -
            PARTICIPANTS_LIST_ORATOR_BOTTOM_OFFSET;
    const notification = useCallNotifications('CallOrator__notification');
    return (_jsx(AppearanceProvider, { value: "dark", children: _jsxs("article", { className: classes, ref: containerRef, children: [_jsxs("main", { className: oratorClasses, onDoubleClick: onFullScreenToggle, children: [!isSharedUrlShown && (_jsx(Overlay, { zIndex: 1, Component: Div, spacing: 16, paddingTop: 16, paddingBottom: 16, 
                            // todo CALL-27700
                            className: "CallOrator__topControlPanel", children: _jsxs(Flex, { gap: 8, children: [_jsx(OratorTitle, { orator: orator.participant, oratorDevice: orator.device, me: me, isPinned: isPinned, isPinnedByAdmin: isPinnedByAdmin, isPinnedByMedia: isPinnedByMedia, isUnpinAllowed: isUnpinAllowed, onUnpin: onUnpin, meGroup: meGroup }), notification, streamSwitcherModes.length > 1 && device.streamMode && (_jsx(StreamModeSwitcher, { modes: streamSwitcherModes, activeMode: device.streamMode, onChangeMode: setStreamMode }))] }) })), _jsx(CallOratorMainWidget, { onStopScreenShare: onStopScreenShare, orator: orator, handleShowCallControls: handleShowCallControls, watchTogetherMovieState: watchTogetherMovieState, localExternalId: localExternalId, me: me, groupId: groupId, meGroup: meGroup, isServerTopology: isServerTopology })] }), _jsx("button", { className: toggleOthersClasses, "data-testid": "calls_call_collapse_participants", onClick: onToggleParticipantsAside, "aria-label": isShownParticipantsAside ? getLang('calls_hide_participants') : getLang('calls_show_participants'), children: isShownParticipantsAside ? (_jsx(Icon16Chevron, { className: classesToggleIcon })) : (_jsx(Icon16ChevronLeft, { className: classesToggleIcon })) }), _jsx("aside", { className: othersClasses, children: _jsxs("ul", { className: "CallOrator__list", style: {
                            height: participantsAsideCount * (SAUSAGE_PARTICIPANT_HEIGHT + SAUSAGE_PARTICIPANT_MARGIN),
                        }, children: [participantsAsideShift > 0 && (_jsx("li", { className: "CallOrator__participant", "data-calls-id": "participant", "data-testid": "calls_sausage_scroll", style: { height: `${participantsAsideShift}px` } }, -1)), children] }) }), isSubtitlesEnabled && (_jsx(CallSubtitles, { isFullScreen: isFullScreen, isShownParticipantsAside: isShownParticipantsAside }))] }) }));
});
export const CallOratorWidget = createWidget(Provider, CallOrator);
//# sourceMappingURL=CallOrator.js.map