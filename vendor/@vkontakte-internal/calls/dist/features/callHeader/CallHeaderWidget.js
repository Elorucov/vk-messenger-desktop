import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"span":["global",{"className":2}]} */
import { useMemo } from 'react';
import { TranslationStatusWidget } from '../../containers/TranslationStatusContainer';
import { AsrStatusWidget } from '../../features/asr';
import { CallHeader } from './components/CallHeader/CallHeader';
import { useLang } from '../../hooks/useLang';
import { createWidget } from '@vkontakte-internal/di';
import { CallHeaderViewModelProvider, useCallHeaderViewModel } from './models/CallHeaderViewModel';
import { observer } from 'mobx-react-lite';
import { CallTimer } from '../../components/CallTimer/CallTimer';
import { RoomStatusWidget } from '../rooms/widgets/roomStatus/RoomStatus';
const CallHeaderView = observer(function CallHeaderView() {
    const model = useCallHeaderViewModel();
    const { getLang } = useLang();
    const { isRoomShown } = model;
    const { onChainClick, isChainControls } = model.props.current;
    const translationStatus = useMemo(() => {
        if (model.isTranslationOn) {
            return _jsx(TranslationStatusWidget, {});
        }
    }, [model.isTranslationOn, model.isTranslationRecord]);
    const speakers = useMemo(() => {
        if (model.speakersInHeader) {
            const { phraseBeforePattern, phraseAfterPattern, speakersLabels } = model.speakersInHeader;
            return (_jsxs(_Fragment, { children: [phraseBeforePattern.length > 0 && _jsx("span", { className: "CallHeader__speak", children: phraseBeforePattern }), speakersLabels, phraseAfterPattern.length > 0 && _jsx("span", { className: "CallHeader__speak", children: phraseAfterPattern })] }));
        }
        return null;
    }, [model.speakersInHeader]);
    return (_jsx(CallHeader, { asr: model.isAsrShown ? _jsx(AsrStatusWidget, {}) : null, translation: translationStatus, roomStatus: isRoomShown ? _jsx(RoomStatusWidget, {}) : null, isTranslationRecord: model.isTranslationRecord, speakers: speakers, hands: model.hands, time: model.timer ? _jsx(CallTimer, { duration: model.timer, label: getLang('calls_call_duration') }) : null, networkTooltipText: model.networkTooltipText, isChainControls: isChainControls, onChainClick: onChainClick }));
});
export const CallHeaderWidget = createWidget(CallHeaderViewModelProvider, CallHeaderView);
//# sourceMappingURL=CallHeaderWidget.js.map