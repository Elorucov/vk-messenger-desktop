import { jsx as _jsx } from "react/jsx-runtime";
import { observer } from 'mobx-react-lite';
import { createWidget } from '@vkontakte-internal/di';
import { AppModelProvider, useAppModel } from './AppModel';
import { LegacyApp } from './LegacyApp';
const App = observer(function App() {
    const { bridge, tabIsMaster, callSounds, config, callsSdk, onBeforeCallStart, onAfterCallFinish, streamUrlExtractor, pip, roomId, participantIdsByMyRoomId, callViewMode, domElementSizeService, roomsService, } = useAppModel();
    return (_jsx(LegacyApp, { SDK: callsSdk, bridge: bridge, tabIsMaster: tabIsMaster, callSounds: callSounds, config: config, onBeforeCallStart: onBeforeCallStart, onAfterCallFinish: onAfterCallFinish, streamUrlExtractor: streamUrlExtractor, roomId: roomId, participantIdsByMyRoomId: participantIdsByMyRoomId, viewMode: callViewMode, pip: pip, updateDimensions: domElementSizeService.update, clearUpdateDimensions: domElementSizeService.clear, roomsService: roomsService }));
});
export const AppWidget = createWidget(AppModelProvider, App);
//# sourceMappingURL=AppWidget.js.map