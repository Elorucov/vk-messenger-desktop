import React, { useCallback, useEffect, useMemo, useState } from 'react';
import cx from 'classnames';
import * as Filters from '../../../core/model/Filters';
import '../../ui/Picker/Picker.css';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useBrowserEnv, useFeatureFlags, useInsertIntoCache, } from '../../hooks/misc';
import { fromApiConvo } from '../../../data/converter/ConvoConverter';
import './SharedConvosPicker.css';
import { PeerPickerListItem } from '../../ui/PeerPickerListItem/PeerPickerListItem';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { NoResults } from '../../ui/NoResults/NoResults';
import { Icon56ErrorOutline } from '@vkontakte/icons';
import { Button } from '@vkontakte/vkui';
import { IconNote } from '../../ui/IconNote/IconNote';
import { useApiFetch } from '../../hooks/useApiFetch';
export const SharedConvosPicker = ({ onSelection, peerId, className, }) => {
    const { lang } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const featureFlags = useFeatureFlags();
    const insertIntoCache = useInsertIntoCache();
    const [sharedPeerIds, setSharedPeerIds] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [hasFailed, setFailed] = useState(false);
    const load = useCallback(async () => {
        setLoading(true);
        setFailed(false);
        try {
            const { profiles, groups, items, contacts } = await apiFetch('messages.getSharedConversations', {
                peer_id: peerId,
                extended: 1,
            });
            insertIntoCache({
                profiles,
                groups,
                conversations: items,
                contacts,
            });
            const convos = [];
            items.forEach((convo) => {
                const model = fromApiConvo(featureFlags, convo);
                if (!model?.convo.peerId) {
                    return;
                }
                convos.push(model.convo);
            });
            const sortedConvos = convos.sort((a, b) => Filters.sorter(a, b));
            const peerIds = sortedConvos.map((convo) => convo.peerId);
            setSharedPeerIds(peerIds);
        }
        catch {
            setFailed(true);
        }
        finally {
            setLoading(false);
        }
    }, [apiFetch, featureFlags, peerId, insertIntoCache]);
    useEffect(() => {
        void load();
    }, [load]);
    const itemData = useMemo(() => {
        return {
            peerIds: sharedPeerIds,
            onSelection,
        };
    }, [sharedPeerIds, onSelection]);
    const render = () => {
        if (isLoading) {
            return (React.createElement("div", { className: "SharedConvosPicker__loader" },
                React.createElement(OptimizedSpinner, null)));
        }
        if (hasFailed) {
            return (React.createElement(IconNote, { icon: React.createElement(Icon56ErrorOutline, null), actions: React.createElement(Button, { onClick: load, mode: "secondary" }, lang.use('me_shared_convos_retry')) }, lang.use('me_shared_convos_load_error')));
        }
        if (sharedPeerIds.length === 0) {
            return (React.createElement("div", { className: "SharedConvosPicker__empty" },
                React.createElement(NoResults, null, lang.use('me_modal_shared_convos_empty'))));
        }
        return (React.createElement(AutoSizer, null, ({ width, height }) => (React.createElement(ScrollbarProvider, { style: { width, height }, overflowX: "hidden" }, ({ scrollableRef, contentRef }) => (React.createElement(FixedSizeList, { layout: "vertical", height: height || 0, width: width || 0, overscanCount: 10, itemSize: 56, itemData: itemData, outerRef: scrollableRef, innerRef: contentRef, itemCount: sharedPeerIds.length }, Item))))));
    };
    return React.createElement("div", { className: cx('SharedConvosPicker', className) }, render());
};
const Item = ({ style, index, data }) => {
    const peerId = data.peerIds[index];
    return (React.createElement("div", { style: style },
        React.createElement(PeerPickerListItem, { peerId: peerId, onSelection: () => data.onSelection(peerId), controlType: "arrow", controlSide: "right", isGlobal: false })));
};
//# sourceMappingURL=SharedConvosPicker.js.map