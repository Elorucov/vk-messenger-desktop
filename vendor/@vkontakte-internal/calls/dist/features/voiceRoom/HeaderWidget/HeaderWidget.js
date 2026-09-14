import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"span":["global",{"className":2}],"div":["global",{"className":2}]} */
import { Div, Separator, Spacing } from '@vkontakte-internal/vkcom-kit';
import { HeaderControlsContainer } from './HeaderControlsContainer';
import { ReactionsHistoryContainer } from './ReactionsHistoryContainer';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getIsVoiceRoomTribuneMode } from '../selectors';
import { createWidget } from '@vkontakte-internal/di';
import { HeaderWidgetViewModelProvider, useHeaderWidgetViewModel } from './HeaderWidgetViewModel';
import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
const HeaderView = observer(function HeaderView() {
    const model = useHeaderWidgetViewModel();
    const isTribune = useTypedSelector(getIsVoiceRoomTribuneMode);
    const speakers = useMemo(() => {
        if (model.speakersInHeader) {
            const { speakersLabels, phraseAfterPattern, phraseBeforePattern } = model.speakersInHeader;
            return (_jsxs(_Fragment, { children: [phraseBeforePattern.length > 0 && _jsx("span", { className: "CallHeader__speak", children: phraseBeforePattern }), speakersLabels, phraseAfterPattern.length > 0 && _jsx("span", { className: "CallHeader__speak", children: phraseAfterPattern })] }));
        }
        return null;
    }, [model.speakersInHeader]);
    return (_jsxs(Div, { paddingBottom: 0, paddingTop: 0, children: [_jsx(HeaderControlsContainer, {}), _jsx(Spacing, { size: 15 }), _jsx(Separator, { wide: true }), _jsx(Spacing, { size: 7 }), _jsxs("div", { className: "VoiceRoom__mainContentHeader", children: [_jsx("div", { className: "VoiceRoom__speakerNames", children: speakers }), isTribune && _jsx(ReactionsHistoryContainer, {})] })] }));
});
export const HeaderWidget = createWidget(HeaderWidgetViewModelProvider, HeaderView);
//# sourceMappingURL=HeaderWidget.js.map