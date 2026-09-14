import React, { useMemo, useState, useCallback } from 'react';
import '../../ui/PeerChipsSearchInput/PeerChipsSearchInput.css';
import { PeerChip } from '../../ui/PeerChip/PeerChip';
import { SearchInputChip, } from '../../ui/SearchInputChip/SearchInputChip';
import cx from 'classnames';
import { MAX_FORWARD_TARGET_COUNT } from '../../ui/ForwardModal/ForwardModal';
export const PeerChipsSearchInput = ({ onQueryChange, onRemove, items, selection, secondary = false, placeholder, onSearchInputKeyDown, }) => {
    const [value, setValue] = useState('');
    const selected = useMemo(() => Array.from(selection.values()), [selection]);
    const selectedPeerIds = useMemo(() => {
        const ids = [];
        for (let index = 0; index < selected.length; index += 1) {
            const item = selected[index];
            if (item?.kind !== 'peer') {
                continue;
            }
            ids.push(item.peerId);
        }
        return ids;
    }, [selected]);
    const canSelect = selectedPeerIds.length < MAX_FORWARD_TARGET_COUNT;
    const onChipRemove = useCallback((id) => {
        const item = [...selected, ...items].find((entry) => entry.kind === 'peer' && entry.peerId === id);
        if (!item) {
            return;
        }
        onRemove?.(item);
    }, [items, selected, onRemove]);
    const handleQueryChange = useCallback((value) => {
        setValue(value);
        onQueryChange(value);
    }, [onQueryChange]);
    const itemRenderer = useCallback((props) => {
        return (React.createElement(PeerChip, { key: props.id, peerId: props.id, onRemove: props.onRemove, className: cx('PeerChipsSearchInput__item', props.className) }));
    }, []);
    return (React.createElement(SearchInputChip, { onQueryChange: handleQueryChange, query: value, onRemove: onChipRemove, placeholder: placeholder, selection: selectedPeerIds, className: "PeerChipsSearchInput", onSearchInputKeyDown: onSearchInputKeyDown, secondary: secondary, disabled: !canSelect }, itemRenderer));
};
export const PeerChipsSearchInputSecondary = (props) => React.createElement(PeerChipsSearchInput, { ...props, secondary: true });
//# sourceMappingURL=PeerChipsSearchInput.js.map