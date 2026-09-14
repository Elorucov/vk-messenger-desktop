import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getUserName, peerIdToVkId, useNavigationContext, } from '@vkontakte-internal/calls-core';
import Entity from '../../palette/Entity/Entity';
import List from '../../palette/List/List';
import ListItem from '../../palette/ListItem/ListItem';
import { CallPhoto } from '../CallPhoto/CallPhoto';
import { Button, Header, Div } from '@vkontakte-internal/vkcom-kit';
import { getSingleLetter } from '../../helpers/participant';
import { useLang } from '../../hooks/useLang';
export const WaitingHallList = ({ members = [], totalCount = 0, onPromote, onForbid, }) => {
    const { getLang } = useLang();
    const { navigateToProfile } = useNavigationContext();
    if (members.length === 0) {
        return _jsx(_Fragment, {});
    }
    return (_jsxs(_Fragment, { children: [_jsx(Div, { mode: "vertical", spacing: 12, paddingTop: 0, paddingBottom: 0, children: _jsx(Header, { mode: "primary", subtitleComponent: "h3", indicator: totalCount || '', children: getLang('calls_waiting_hall_list_header') }) }), _jsx(List, { border: false, className: "CallParticipantList__list CallParticipantList__list--waitingList", children: members.map((member) => {
                    const isNFT = !!member.is_nft;
                    const name = getUserName(member);
                    const onLinkClick = (e, link) => {
                        navigateToProfile(e, link, peerIdToVkId(member.peerId));
                    };
                    return (_jsx(ListItem, { selectable: false, border: false, aside: _jsxs(_Fragment, { children: [_jsx(Button, { size: "m", onClick: () => onForbid(member.peerId), mode: "secondary", children: getLang('calls_waiting_hall_forbid') }), _jsx(Button, { size: "m", onClick: () => onPromote(member.peerId), children: getLang('calls_waiting_hall_join') })] }), children: _jsx(Entity, { onLinkClick: onLinkClick, photo: _jsx(CallPhoto, { peerId: member.peerId, photo: member.photo, alt: name, letter: getSingleLetter(name), size: isNFT ? 36 : 40, isNFT: isNFT }), title: name, href: member.link, target: "_blank" }) }, member.peerId));
                }) })] }));
};
//# sourceMappingURL=WaitingHallList.js.map