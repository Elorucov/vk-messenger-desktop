import { __decorate, __metadata } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"CustomScrollView":["@vkontakte-internal/vkcom-kit",{"className":1}],"div":["global",{"style":1}]} */
import { CustomScrollView } from '@vkontakte-internal/vkcom-kit';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getVoiceRoomListenersPagesList, getVoiceRoomListenersTotalCount } from '../selectors';
import { useLang } from '../../../hooks/useLang';
import { getMeGroup, getMyDevice, getParticipants } from '../../../selectors';
import { VirtualSpeakersRow } from './VirtualSpeakersRow';
import { VirtualListenersRow } from './VirtualListenersRow';
import { SausageListHeader } from './SausageListHeader';
import { useIsMe, useSpeakerDropdownActions, useSpeakerStream } from '../hooks';
import { COUNT_SPEAKERS_IN_SAUSAGE_LINE, ROWS, useSausageVirtualizer } from './useSausageVirtualizer';
import { useFetchListeners } from './useFetchListeners';
import { externalIdToString } from '@vkontakte-internal/calls-core';
import { SpeakersService } from '../../../services/speakers';
import { createProvider, createWidget, scope } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { DevicesService } from '../../../services/devices/DevicesService';
import { VoiceRoomSpeakersService } from '../services/VoiceRoomSpeakersService';
let SausageParticipantsViewModel = class SausageParticipantsViewModel {
    constructor(speakersService, devicesService, voiceRoomSpeakersService) {
        this.speakersService = speakersService;
        this.devicesService = devicesService;
        this.voiceRoomSpeakersService = voiceRoomSpeakersService;
        this.isParticipantSpeaking = (externalId) => {
            const stringId = externalIdToString(externalId);
            return this.speakersService.speakers[stringId];
        };
    }
    get speakersCount() {
        return this.devicesService.voiceRoomActiveDevicesCount;
    }
    get activeSpeakers() {
        return this.voiceRoomSpeakersService.activeSpeakers;
    }
};
SausageParticipantsViewModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [SpeakersService,
        DevicesService,
        VoiceRoomSpeakersService])
], SausageParticipantsViewModel);
export const { Provider: SausageParticipantsViewModelProvider, useModel: useSausageParticipantsViewModel } = createProvider(SausageParticipantsViewModel, { isolatedContext: false, onlyTransient: true });
const SausageParticipantsView = observer(function SausageParticipantsView() {
    const model = useSausageParticipantsViewModel();
    const { speakersCount, activeSpeakers } = model;
    const { getLang } = useLang();
    const listenersCount = useTypedSelector(getVoiceRoomListenersTotalCount);
    const pagesMap = useTypedSelector(getVoiceRoomListenersPagesList);
    useFetchListeners();
    const { rowVirtualizer, columnSpeakersVirtualizer, columnListenersVirtualizer, rowKeys, checkActiveSticky, parentRef, rowsSpeakersOffset, rowsListenersOffset, } = useSausageVirtualizer(speakersCount);
    const participants = useTypedSelector(getParticipants);
    const localDevice = useTypedSelector(getMyDevice);
    const meGroup = useTypedSelector(getMeGroup);
    // todo Реализовать пин в случае возвращения к коду voiceRooms
    const getActions = useSpeakerDropdownActions({ setPinnedParticipant: () => { } });
    const checkIsMe = useIsMe();
    const getSpeakerStream = useSpeakerStream();
    const measureListenerElement = (el) => {
        rowVirtualizer.measureElement(el);
        columnListenersVirtualizer.measureElement(el);
    };
    return (_jsx(CustomScrollView, { boxRef: parentRef, className: "CallsVoiceRoomCall__sausageBox", autoHideScrollbar: true, children: _jsx("div", { style: { height: rowVirtualizer.getTotalSize() }, children: rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const rowKey = rowKeys[virtualRow.index];
                switch (rowKey) {
                    case ROWS.SPEAKERS_ROW_HEADER: {
                        return (_jsx(SausageListHeader, { dataIndex: "SausageListSpeakersHeader", count: speakersCount, title: getLang('voicerooms_more_speakers'), size: virtualRow.size, offset: virtualRow.start, isSticky: checkActiveSticky(virtualRow.index) }, "SausageListSpeakersHeader"));
                    }
                    case ROWS.SPEAKERS_ROW: {
                        return (_jsx(VirtualSpeakersRow, { virtualColumnItems: columnSpeakersVirtualizer.getVirtualItems(), virtualRow: virtualRow, rowsSpeakersOffset: rowsSpeakersOffset, activeSpeakers: activeSpeakers, localDevice: localDevice, participants: participants, meGroup: meGroup, speakersCount: speakersCount, getActions: getActions, checkIsSpeaking: model.isParticipantSpeaking, checkIsMe: checkIsMe, getStream: getSpeakerStream, speakerSize: 72, countSpeakersInLine: COUNT_SPEAKERS_IN_SAUSAGE_LINE, itemClassName: "CallsVoiceRoom_SausageParticipantWrapper" }, `SausageListSpeakers-${virtualRow.index}`));
                    }
                    case ROWS.LISTENERS_ROW_HEADER: {
                        return (_jsx(SausageListHeader, { dataIndex: "SausageListListenersHeader", count: listenersCount, title: getLang('voicerooms_listeners'), size: virtualRow.size, offset: virtualRow.start, isSticky: checkActiveSticky(virtualRow.index) }, "SausageListListenersHeader"));
                    }
                    case ROWS.LISTENERS_ROW: {
                        return (_jsx(VirtualListenersRow, { virtualColumnItems: columnListenersVirtualizer.getVirtualItems(), virtualRow: virtualRow, rowsListenersOffset: rowsListenersOffset, listenersCount: listenersCount, pagesMap: pagesMap, measureElement: measureListenerElement }, `SausageListListeners-${virtualRow.index}`));
                    }
                    default: {
                        return null;
                    }
                }
            }) }) }));
});
export const SausageParticipantsWidget = createWidget(SausageParticipantsViewModelProvider, SausageParticipantsView);
//# sourceMappingURL=SausageParticipantsWidget.js.map