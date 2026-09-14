import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}],"main":["global",{"className":1}]} */
import { Participant, ParticipantAppearance } from '../Participant';
export const WaitingHall = ({ name, letter, externalId }) => {
    return (_jsx("div", { className: "WaitingHall", children: _jsx("main", { className: "WaitingHall__main", children: _jsx(Participant, { appearance: ParticipantAppearance.WAITING, externalId: externalId, isMe: true, name: name, letter: letter }) }) }));
};
//# sourceMappingURL=WaitingHall.js.map