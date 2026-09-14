import { __decorate, __metadata } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"CustomScrollView":["@vkontakte-internal/vkcom-kit",{"className":1}],"div":["global",{"style":1,"className":1}]} */
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { useRef } from 'react';
import { CustomScrollView } from '@vkontakte-internal/vkcom-kit';
import { getIsFullScreen, getMeGroup, getMyDevice, getParticipants } from '../../../selectors';
import { useIsMe } from '../../../features/voiceRoom/hooks/useIsMe';
import { useSpeakerStream } from '../../../features/voiceRoom/hooks/useSpeakerStream';
import { useSpeakerDropdownActions } from '../../../features/voiceRoom/hooks/useParticipantDropdownActions';
import { useVirtualizer } from '@tanstack/react-virtual';
// todo Подумать над неймингом или струкнурой. Неочевидно, что компонент лежит в колбасе, а используется в гриде
import { VirtualSpeakersRow } from '../SausageParticipantsWidget/VirtualSpeakersRow';
import { classNames as cx } from '@vkontakte/vkjs';
import { SpeakersService } from '../../../services/speakers';
import { externalIdToString } from '@vkontakte-internal/calls-core';
import { createProvider, createWidget, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import { DevicesService } from '../../../services/devices/DevicesService';
import { VoiceRoomSpeakersService } from '../services/VoiceRoomSpeakersService';
const MAX_COUNT_SPEAKERS_IN_LINE = 5;
const SPEAKER_CARD_WIDTH = 120;
const SPEAKER_CARD_HEIGHT = 142;
const CONTAINER_PADDING = 18;
const MAX_SPEAKERS_WITHOUT_SCROLL = 10;
let GridSpeakersWidgetViewModel = class GridSpeakersWidgetViewModel {
    constructor(devicesService, voiceRoomSpeakersService, speakersService) {
        this.devicesService = devicesService;
        this.voiceRoomSpeakersService = voiceRoomSpeakersService;
        this.speakersService = speakersService;
        this.isParticipantSpeaking = (externalId) => {
            const stringId = externalIdToString(externalId);
            return this.speakersService.speakers[stringId];
        };
        makeAutoObservable(this);
    }
    get speakersCount() {
        return this.devicesService.voiceRoomActiveDevicesCount;
    }
    get activeSpeakers() {
        return this.voiceRoomSpeakersService.activeSpeakers;
    }
};
GridSpeakersWidgetViewModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [DevicesService,
        VoiceRoomSpeakersService,
        SpeakersService])
], GridSpeakersWidgetViewModel);
export const { Provider: GridSpeakersWidgetViewModelProvider, useModel: useGridSpeakersWidgetViewModel } = createProvider(GridSpeakersWidgetViewModel, { isolatedContext: false, onlyTransient: true });
const GridSpeakersView = observer(function GridSpeakersView() {
    const { speakersCount, activeSpeakers, isParticipantSpeaking } = useGridSpeakersWidgetViewModel();
    const parentRef = useRef(null);
    const rowsCount = Math.ceil(speakersCount / MAX_COUNT_SPEAKERS_IN_LINE);
    const isScroll = speakersCount > MAX_SPEAKERS_WITHOUT_SCROLL;
    const isFullScreen = useTypedSelector(getIsFullScreen);
    const participants = useTypedSelector(getParticipants);
    const localDevice = useTypedSelector(getMyDevice);
    const meGroup = useTypedSelector(getMeGroup);
    // todo Реализовать пин в случае возвращения к коду voiceRooms
    const getActions = useSpeakerDropdownActions({ setPinnedParticipant: () => { } });
    const checkIsMe = useIsMe();
    const getSpeakerStream = useSpeakerStream();
    const virtualRows = useVirtualizer({
        count: rowsCount,
        getScrollElement: () => parentRef.current,
        estimateSize: () => SPEAKER_CARD_HEIGHT,
        onChange: () => { },
    });
    const virtualColumns = useVirtualizer({
        horizontal: true,
        count: MAX_COUNT_SPEAKERS_IN_LINE,
        getScrollElement: () => parentRef.current,
        estimateSize: () => SPEAKER_CARD_WIDTH,
        paddingStart: CONTAINER_PADDING,
        paddingEnd: CONTAINER_PADDING,
    });
    const height = isScroll ? virtualRows.getTotalSize() : '100%';
    const rows = virtualRows.getVirtualItems();
    const columns = virtualColumns.getVirtualItems();
    const containerClassNames = cx('CallsVoiceRoomCall__ActiveDevicesListContainer', !isScroll && !isFullScreen && 'CallsVoiceRoomCall__ActiveDevicesListContainer--withoutScroll');
    return (_jsx(CustomScrollView, { className: cx('CallsVoiceRoomCall__ActiveDevicesList', isFullScreen && 'CallsVoiceRoomCall__ActiveDevicesList--fullScreen'), boxRef: parentRef, autoHideScrollbar: true, children: _jsx("div", { style: { height }, className: containerClassNames, children: rows.map((virtualRow) => {
                return (_jsx(VirtualSpeakersRow, { virtualColumnItems: columns, virtualRow: virtualRow, activeSpeakers: activeSpeakers, meGroup: meGroup, localDevice: localDevice, participants: participants, speakersCount: speakersCount, getActions: getActions, checkIsSpeaking: isParticipantSpeaking, checkIsMe: checkIsMe, getStream: getSpeakerStream, speakerSize: getAvatarSize(speakersCount), countSpeakersInLine: MAX_COUNT_SPEAKERS_IN_LINE, isVirtualPosition: isScroll, itemClassName: cx(isScroll && 'CallsVoiceRoom_SausageParticipantWrapper') }, virtualRow.key));
            }) }) }));
});
export const GridSpeakersWidget = createWidget(GridSpeakersWidgetViewModelProvider, GridSpeakersView);
function getAvatarSize(speakersAmount) {
    if (speakersAmount > 8)
        return 96;
    if (speakersAmount > 3)
        return 120;
    if (speakersAmount > 2)
        return 160;
    return 240;
}
//# sourceMappingURL=GridSpeakersWidget.js.map