import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2}]} */
import { useCallback, useEffect, useState } from 'react';
import { Placeholder } from '@vkontakte-internal/vkcom-kit';
import { useTypedDispatch } from '../hooks/useTypedDispatch';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { E_ACTION } from '../constants';
import { KickParticipantType, ModalType, useIndexer, } from '@vkontakte-internal/calls-core';
import { WaitingHallList } from '../components/WaitingHallList/WaitingHallList';
import { WaitingHallListNew } from '../components/WaitingHallListNew';
import { ListMore } from '../palette/ListMore/ListMore';
import { promoteUserAndRemoveFromWaitingHall, promoteUsersAndRemoveFromWaitingHall, } from '../actions/waitingHall';
import { CallManagementModal } from '../components/CallManagementModal/CallManagementModal';
import { BlockSearchInput } from '../palette/BlockSearchInput/BlockSearchInput';
import { useLang } from '../hooks/useLang';
import { toggleModal } from '../actions';
import { getWaitingHall } from '../selectors';
import { useConfig } from '../services/config';
const SHORT_LIST_COUNT = 5;
export const WaitingHallListContainer = ({ isModal, onMore, isWithBackButton, onBackClick, }) => {
    const onBack = isWithBackButton ? onBackClick : () => { };
    const dispatch = useTypedDispatch();
    const { enableNewViewOfMuteActions, enableNewViewOfMuteActionsSferum, sferum: isSferum } = useConfig();
    const { getLang } = useLang();
    const waitingHall = useTypedSelector(getWaitingHall);
    const [needMore, setNeedMore] = useState(() => !isModal && needMoreUsersFromWaitingHall(waitingHall));
    const [searchQuery, setSearchQuery] = useState('');
    const allMembers = waitingHall ? Array.from(waitingHall.members.values()) : [];
    const nameGetter = useCallback((member) => member.name, []);
    const idGetter = useCallback((member) => member.peerId, []);
    const searchIndex = useIndexer(isModal ? allMembers : [], nameGetter, idGetter);
    const hasNewViewOfMuteActions = isSferum ? enableNewViewOfMuteActionsSferum : enableNewViewOfMuteActions;
    const onSearchChange = useCallback((e) => {
        const event = e;
        setSearchQuery(event.target.value);
    }, []);
    let members = isModal ? allMembers : allMembers.slice(0, SHORT_LIST_COUNT);
    if (searchQuery) {
        members = searchIndex.search(searchQuery);
    }
    useEffect(() => {
        setNeedMore(!isModal && needMoreUsersFromWaitingHall(waitingHall));
    }, [waitingHall?.totalCount, isModal]);
    const onForbid = useCallback((peerId) => {
        if (waitingHall?.members.has(peerId)) {
            dispatch(toggleModal(ModalType.KICK_PARTICIPANT, {
                peerId,
                kickType: KickParticipantType.WAITING_HALL,
            }));
        }
    }, [waitingHall?.members]);
    const onPromote = useCallback((peerId) => {
        if (waitingHall) {
            promoteUserAndRemoveFromWaitingHall(peerId, waitingHall, dispatch);
        }
    }, [waitingHall?.members]);
    const onPromoteMultiple = useCallback((peerIds) => {
        if (waitingHall) {
            promoteUsersAndRemoveFromWaitingHall(peerIds, waitingHall, dispatch);
        }
    }, [waitingHall?.members]);
    const onShowMore = useCallback(() => {
        onMore && onMore();
    }, [waitingHall]);
    const hideGroupCallSetup = () => {
        dispatch({
            type: E_ACTION.GROUP_CALL_SETUP,
            open: false,
            preselectedIds: null,
        });
    };
    const waitingHallList = (_jsxs(_Fragment, { children: [!!members?.length && (_jsx(_Fragment, { children: hasNewViewOfMuteActions && !isModal ? (_jsx(WaitingHallListNew, { members: members, onForbid: onForbid, onPromote: onPromote, onPromoteMultiple: onPromoteMultiple, totalCount: waitingHall?.totalCount })) : (_jsx(WaitingHallList, { members: members, totalCount: waitingHall?.totalCount, onPromote: onPromote, onForbid: onForbid })) })), needMore && _jsx(ListMore, { onClick: onShowMore, children: getLang('calls_waiting_hall_more_text') })] }));
    if (isModal) {
        return (_jsx(CallManagementModal, { title: getLang('calls_waiting_hall_title'), onCloseModal: hideGroupCallSetup, isWithBackButton: isWithBackButton, onBackClick: onBack, children: _jsxs("div", { className: "CallParticipantList CallParticipantList--waiting-hall", children: [allMembers.length > 0 && (_jsxs(_Fragment, { children: [_jsx(BlockSearchInput, { value: searchQuery, placeholder: getLang('calls_search_participants_placeholder'), onChange: onSearchChange, onInput: onSearchChange, onPaste: onSearchChange, className: "CallParticipantList__input" }), waitingHallList, searchQuery && members.length === 0 && (_jsx(Placeholder, { children: getLang('calls_participants_not_found') }))] })), allMembers.length === 0 && (_jsx("div", { className: "CallParticipantList--placeholderWrapper", children: _jsx(Placeholder, { children: getLang('calls_waiting_hall_not_users') }) }))] }) }));
    }
    return waitingHallList;
};
function needMoreUsersFromWaitingHall(waitingHall) {
    if (waitingHall) {
        return waitingHall.totalCount > SHORT_LIST_COUNT;
    }
    return false;
}
//# sourceMappingURL=WaitingHallListContainter.js.map