import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1,"style":1}],"ModalScrollView":["@vkontakte-internal/vkcom-kit",{"className":1}]} */
import { useRef, useState } from 'react';
import { classNames } from '@vkontakte/vkjs';
import { ModalScrollView, Search, Spacing, Header, Div } from '@vkontakte-internal/vkcom-kit';
import { BlockSearchInput } from '../../../../palette/BlockSearchInput/BlockSearchInput';
import List from '../../../../palette/List/List';
import { useLang } from '../../../../hooks/useLang';
import { useResizeObserver } from '../../../../hooks/useResizeObserver';
import { useConfig } from '../../../../services/config';
export const CallParticipantList = ({ searchQuery, onSearchChange, length, children, waitingHallList, }) => {
    const { getLang } = useLang();
    const { enableNewViewOfMuteActions, enableNewViewOfMuteActionsSferum, sferum: isSferum } = useConfig();
    const hasNewViewOfMuteActions = isSferum ? enableNewViewOfMuteActionsSferum : enableNewViewOfMuteActions;
    const scrollViewRootRef = useRef(null);
    const scrollViewRef = useRef(null);
    const [height, setHeight] = useState();
    useResizeObserver({
        onResize: () => {
            const { scrollHeight } = scrollViewRef.current || {};
            if (scrollHeight) {
                setHeight((scrollViewRootRef.current?.offsetTop ?? 0) + scrollHeight);
            }
        },
        ref: scrollViewRootRef,
    });
    return (_jsxs("div", { className: classNames('CallParticipantList', !hasNewViewOfMuteActions && 'OldCallParticipantList'), style: hasNewViewOfMuteActions ? { height } : undefined, children: [hasNewViewOfMuteActions ? (_jsxs("div", { children: [_jsx(Search, { "data-testid": "calls_participant_list_search", onChange: onSearchChange, placeholder: getLang('calls_search_participants_placeholder'), value: searchQuery }), _jsx(Spacing, { size: 4 })] })) : (_jsx(BlockSearchInput, { value: searchQuery, "data-testid": "calls_participant_list_search", placeholder: getLang('calls_search_participants_placeholder'), onChange: onSearchChange, onInput: onSearchChange, onPaste: onSearchChange, className: "CallParticipantList__input" })), !!waitingHallList && waitingHallList, !hasNewViewOfMuteActions && (_jsx(Div, { "data-testid": "calls_participant_list_header", mode: "vertical", spacing: 12, paddingTop: 0, paddingBottom: 0, children: _jsx(Header, { mode: "primary", subtitleComponent: "h3", indicator: length || '', children: getLang('calls_participant_list_header') }) })), hasNewViewOfMuteActions ? (_jsxs(ModalScrollView, { className: "CallParticipantList__scrollWrapper", getRef: scrollViewRef, getRootRef: scrollViewRootRef, children: [children, _jsx(Spacing, { size: 12 })] })) : (_jsx(List, { border: false, className: "CallParticipantList__list", children: children }))] }));
};
//# sourceMappingURL=CallParticipantList.js.map