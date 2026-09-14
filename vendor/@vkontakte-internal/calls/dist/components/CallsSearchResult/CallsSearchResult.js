import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { memo } from 'react';
import ListItem from '../../palette/ListItem/ListItem';
import { ParticipantSuggest } from '../ParticipantSuggest/ParticipantSuggest';
import { SearchResultType } from '../../constants';
import { ListMore } from '../../palette/ListMore/ListMore';
import { Icon16Phone } from '@vkontakte/icons';
import { Button, Spinner, Header, Div } from '@vkontakte-internal/vkcom-kit';
const CallsSearchResultComponent = ({ data, onClick, selected, disabled, loading, moreButtonDisabled, }) => {
    if ('type' in data) {
        switch (data.type) {
            case SearchResultType.HEADER:
                return (_jsx(Div, { mode: "vertical", spacing: 12, paddingTop: 0, paddingBottom: 0, children: _jsx(Header, { mode: "primary", subtitleComponent: "h3", indicator: data.count, children: data.text }) }));
            case SearchResultType.CALL_ALL_IN_CHAT:
                return (_jsx("div", { className: "CallsSearchResult CallsSearchResult--select", children: _jsx(Button, { before: _jsx(Icon16Phone, {}), size: "m", mode: "secondary", stretched: true, onClick: onClick, children: data.text }) }));
            case SearchResultType.MEMBERS_MORE:
            case SearchResultType.FRIENDS_MORE:
            case SearchResultType.GROUP_MEMBERS_MORE:
                return (_jsx(ListMore, { disabled: moreButtonDisabled, onClick: onClick, children: loading ? _jsx(Spinner, { size: "small" }) : data.text }));
        }
    }
    return (_jsx(ListItem, { className: "CallsSearchResult--list-item", "data-id": data.peerId, onClick: onClick, selectable: !disabled, children: _jsx(ParticipantSuggest, { member: data, selected: selected, disabled: disabled }) }));
};
export const CallsSearchResult = memo(CallsSearchResultComponent);
//# sourceMappingURL=CallsSearchResult.js.map