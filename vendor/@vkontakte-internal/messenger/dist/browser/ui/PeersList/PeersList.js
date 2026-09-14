import '../../ui/PeersList/PeersList.css';
import React, { useCallback, useMemo } from 'react';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as VirtualList } from 'react-window';
import * as Peer from '../../../core/model/Peer';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { usePeers } from '../../hooks/misc';
import { PeerListItemLink } from '../../ui/PeerListItem/PeerListItem';
const ROW_HEIGHT = 48;
const OVERSCAN_COUNT = 5;
export const PeersList = ({ peerIds, hasMore, onItemClick, onLoadMore, }) => {
    const peers = usePeers();
    const profiles = useMemo(() => peerIds.map((peerId) => Peer.safeGet(peers, peerId)), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [peerIds]);
    const isItemLoaded = useCallback((index) => !!profiles[index], [profiles]);
    const itemsCount = hasMore ? profiles.length + 1 : profiles.length;
    return (React.createElement("div", { className: "PeersList" },
        React.createElement(AutoSizer, null, (size) => (React.createElement(InfiniteLoader, { isItemLoaded: isItemLoaded, itemCount: itemsCount, loadMoreItems: onLoadMore }, ({ onItemsRendered, ref }) => (React.createElement(VirtualList, { ref: ref, className: "PeersList__list", onItemsRendered: onItemsRendered, height: size.height || 0, width: size.width || 0, innerElementType: "ul", itemData: {
                profiles,
                onItemClick,
            }, itemCount: itemsCount, itemSize: ROW_HEIGHT, overscanCount: OVERSCAN_COUNT }, RowRenderer)))))));
};
const RowRenderer = React.memo(({ index, style, data: { profiles, onItemClick } }) => {
    if (index === profiles.length) {
        return (React.createElement("li", { style: style },
            React.createElement(OptimizedSpinner, { className: "PeersList__loader" })));
    }
    const peer = profiles[index];
    if (!peer) {
        // Невозможный сценарий
        return null;
    }
    return React.createElement(PeerListItemLink, { peer: peer, onNavigate: onItemClick });
});
//# sourceMappingURL=PeersList.js.map