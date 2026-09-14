import React, { useCallback } from 'react';
import { Icon56ErrorOutline } from '@vkontakte/icons';
import '../../ui/PeerPickerList/PeerPickerList.css';
import { PickerList } from '../../ui/PickerList/PickerList';
import { PeerPickerListItem } from '../../ui/PeerPickerListItem/PeerPickerListItem';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { IconNote } from '../../ui/IconNote/IconNote';
import { NoResults } from '../../ui/NoResults/NoResults';
import { useBrowserEnv } from '../../hooks/misc';
import { exhaustivenessCheck } from '../../../core/utils/misc';
export const PeerPickerList = ({ controlType, controlSide, viewerAsFavorites = true, loaderNode, errorNode, emptyNode, itemRenderer, itemHeight = 56, canSelect = true, withRestrictedDisabling, ...props }) => {
    const { lang } = useBrowserEnv();
    const defaultItemRenderer = useCallback((entry) => {
        switch (entry.item.kind) {
            case 'peer':
                return (React.createElement(PeerPickerListItem, { isGlobal: entry.item.isGlobal, withRestrictedDisabling: withRestrictedDisabling, controlType: controlType, controlSide: controlSide, viewerAsFavorites: viewerAsFavorites, selected: entry.selected, subhead: entry.item.subhead, disabled: (!canSelect && !entry.selected && controlType === 'check') ||
                        entry.disabled, description: entry.description, peerId: entry.item.peerId, onSelection: () => entry.onSelection({
                        id: entry.id,
                        value: entry.item,
                    }) }));
            case 'edu_peer':
                return (React.createElement(PeerPickerListItem, { withRestrictedDisabling: withRestrictedDisabling, controlType: controlType, controlSide: controlSide, viewerAsFavorites: viewerAsFavorites, selected: entry.selected, disabled: (!canSelect && !entry.selected && controlType === 'check') ||
                        entry.disabled, subhead: entry.item.node, peerId: entry.item.peerId, onSelection: () => entry.onSelection({
                        id: entry.id,
                        value: entry.item,
                    }) }));
            case 'template':
                return entry.item.node;
            default:
                return exhaustivenessCheck(entry.item);
        }
    }, [
        viewerAsFavorites,
        controlType,
        controlSide,
        withRestrictedDisabling,
        canSelect,
    ]);
    const renderContent = (node) => {
        return React.createElement("div", { className: "PeerPickerList__content" }, node);
    };
    return (React.createElement(PickerList, { ...props, itemRenderer: itemRenderer || defaultItemRenderer, itemHeight: itemHeight, loaderNode: renderContent(loaderNode || React.createElement(OptimizedSpinner, null)), errorNode: renderContent(errorNode || (React.createElement(IconNote, { icon: React.createElement(Icon56ErrorOutline, null) },
            React.createElement("div", { className: "PeerPickerList__error" }, lang.use('me_picker_peer_list_error'))))), emptyNode: renderContent(emptyNode || (React.createElement(NoResults, null, lang.use('me_picker_peer_list_empty')))) }));
};
//# sourceMappingURL=PeerPickerList.js.map