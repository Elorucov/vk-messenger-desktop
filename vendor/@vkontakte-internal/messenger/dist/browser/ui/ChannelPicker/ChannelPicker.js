import React, { useState, useEffect, useMemo, useCallback, } from 'react';
import { PeerChipsSearchInputSecondary } from '../../ui/PeerChipsSearchInput/PeerChipsSearchInput';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { Picker, } from '../../ui/Picker/Picker';
import '../../ui/ConvoPicker/ConvoPicker.css';
import cx from 'classnames';
/** Компонент сделан по подобию ConvoPicker */
export const ChannelPicker = ({ groups, listRenderer, templateItemsCount = 0, onSelectionChange, onQueryChange, className, }) => {
    const [currentQuery, setCurrentQuery] = useState('');
    const [groupsSearched, setGroupsSearched] = useState([]);
    const [selection, setSelection] = useState(new Map());
    const items = (groupsSearched || groups || []).map((group) => ({
        kind: 'peer',
        peerId: group.id,
    }));
    const total = useMemo(() => {
        return templateItemsCount + (groupsSearched.length || groups.length);
    }, [groupsSearched.length, groups.length, templateItemsCount]);
    const search = () => {
        setGroupsSearched(() => {
            return groups.filter((group) => group.name.toLowerCase().includes(currentQuery.toLowerCase()));
        });
    };
    const handleQueryChange = useCallback((value) => {
        setCurrentQuery(value);
        onQueryChange?.(value);
    }, [setCurrentQuery, onQueryChange]);
    const getItemId = (item) => {
        switch (item.kind) {
            case 'peer':
                return item.peerId.toString();
            case 'template':
                return item.id;
            default:
                return exhaustivenessCheck(item);
        }
    };
    const getSelectionPeerIds = (selection) => {
        return Array.from(selection.values()).reduce((acc, v) => {
            return v.kind === 'peer' ? [...acc, v.peerId] : acc;
        }, []);
    };
    useEffect(() => {
        onSelectionChange(getSelectionPeerIds(selection));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selection]);
    return (React.createElement(Picker, { items: items, total: total, onSelectionChange: setSelection, getItemId: getItemId, search: search, initialQuery: "", selection: selection, listRenderer: listRenderer, searchRenderer: PeerChipsSearchInputSecondary, strategy: "singular", onQueryChange: handleQueryChange, className: cx('vkmConvoPicker', className) }));
};
//# sourceMappingURL=ChannelPicker.js.map