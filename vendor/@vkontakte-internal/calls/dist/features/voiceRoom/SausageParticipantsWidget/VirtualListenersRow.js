import { jsx as _jsx } from "react/jsx-runtime";
import { Fragment } from 'react';
import { VoiceRoomParticipant, VoiceRoomParticipantSkeleton } from '@vkontakte-internal/vkcom-kit';
import { COUNT_LISTENERS_IN_LINE, LISTENERS_PAGE_SIZE } from '../constants';
import { getVoiceRoomParticipantName } from '../helpers';
import { useListenerDropdownActions } from '../hooks';
import { generateVirtualItemKey, getVirtualItemIndex } from './helpers';
import { VirtualItemContainer } from './VirtualItemContainer';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getListenersCardHeight, getListenersCardWidth, getVoiceRoomListenerSize } from '../selectors';
import { vou } from '../../../helpers/helpers';
export const VirtualListenersRow = ({ virtualRow, virtualColumnItems, rowsListenersOffset, listenersCount, pagesMap, measureElement, }) => {
    const listenersCardWidth = useTypedSelector(getListenersCardWidth);
    const listenersCardHeight = useTypedSelector(getListenersCardHeight);
    const getActions = useListenerDropdownActions();
    const size = useTypedSelector(getVoiceRoomListenerSize);
    return (_jsx(Fragment, { children: virtualColumnItems.map((virtualColumn) => {
            const elemNumber = getVirtualItemIndex(virtualRow.index, virtualColumn.index, COUNT_LISTENERS_IN_LINE, rowsListenersOffset);
            const chunkPage = Math.floor(elemNumber / LISTENERS_PAGE_SIZE);
            const chunkIndex = elemNumber - chunkPage * LISTENERS_PAGE_SIZE;
            const pageArray = pagesMap[chunkPage] || [];
            const user = pageArray[chunkIndex];
            if (elemNumber + 1 > listenersCount) {
                return null;
            }
            const key = generateVirtualItemKey(virtualRow.index, virtualColumn.index, user?.id);
            return (_jsx(VirtualItemContainer, { dataIndex: key, className: "CallsVoiceRoom_SausageParticipantWrapper", width: listenersCardWidth, height: listenersCardHeight, offsetX: virtualColumn.start, offsetY: virtualRow.start, measureElement: measureElement, children: user ? (_jsx(VoiceRoomParticipant, { size: size, userName: getVoiceRoomParticipantName(user), src: user.photo, actions: getActions(user), gradientColor: vou(!user.photo, 'blue') })) : (_jsx(VoiceRoomParticipantSkeleton, { size: size })) }, key));
        }) }, virtualRow.key));
};
//# sourceMappingURL=VirtualListenersRow.js.map