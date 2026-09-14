import { jsx as _jsx } from "react/jsx-runtime";
import { useRef } from 'react';
import PureMultiSelect from '../../palette/PureMultiSelect/PureMultiSelect';
import { useLang } from '../../hooks/useLang';
export const CallsMultiSelect = ({ tokens, onRemoveToken, value, onChange, onSelect, renderSuggest, data, ...otherProps }) => {
    const noop = useRef(() => { });
    const { getLang } = useLang();
    return (_jsx(PureMultiSelect, { className: "CallsMultiSelect", tokens: tokens, removeTokenPlaceholder: getLang('calls_remove_token'), onRemoveToken: onRemoveToken, placeholder: getLang('calls_search_participants_placeholder'), value: value, onChange: onChange, onSelect: onSelect, useInfiniteScroll: false, hasMore: false, virtualized: false, loadMore: noop.current, notFoundText: getLang('calls_participants_not_found'), autoFocus: true, isSearching: false, renderSuggest: renderSuggest, data: data, ...otherProps }));
};
//# sourceMappingURL=CallsMultiSelect.js.map