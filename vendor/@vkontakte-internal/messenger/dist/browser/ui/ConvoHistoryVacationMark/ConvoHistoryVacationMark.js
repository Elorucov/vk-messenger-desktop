import '../../ui/ConvoHistoryVacationMark/ConvoHistoryVacationMark.css';
import React from 'react';
import { EmployeeVacationMark } from '../../ui/EmployeeVacationMark/EmployeeVacationMark';
import { usePeers } from '../../hooks/misc';
export const ConvoHistoryVacationMark = ({ userId, }) => {
    const peers = usePeers();
    const peer = peers.get(userId);
    if (!peer || peer.kind !== 'User') {
        return null;
    }
    return (React.createElement(EmployeeVacationMark, { peer: peer, hasIcon: true, hasName: true, Wrapper: ({ children }) => (React.createElement("div", { className: "ConvoHistoryVacationMark__container" },
            React.createElement("div", { className: "ConvoHistoryVacationMark" }, children))) }));
};
//# sourceMappingURL=ConvoHistoryVacationMark.js.map