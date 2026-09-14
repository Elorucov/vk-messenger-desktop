import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, ButtonGroup, Card, Header, Link, RichAvatar, SimpleCell, Spacing, calcInitialsAvatarColor, } from '@vkontakte-internal/vkcom-kit';
import { getUserName, peerIdToVkId, useNavigationContext, } from '@vkontakte-internal/calls-core';
import { getSingleLetter } from '../../helpers/participant';
import { getIdForColorCalculation } from '../../helpers/user';
import { useLang } from '../../hooks/useLang';
export const WaitingHallListNew = ({ members, onForbid, onPromote, onPromoteMultiple, totalCount = 0, }) => {
    const { getLang } = useLang();
    const { navigateToProfile } = useNavigationContext();
    const handlePromoteMultiple = () => onPromoteMultiple(members.map((item) => item.peerId));
    const getTitle = (name, peerId, link) => {
        const onLinkClick = (e, link) => navigateToProfile(e, link, peerIdToVkId(peerId));
        return link ? (_jsx(Link, { href: link, onClick: onLinkClick, target: "_blank", children: name })) : (name);
    };
    return (_jsxs(Card, { children: [_jsx(Header, { indicator: totalCount || '', aside: _jsx(Button, { mode: "link", onClick: handlePromoteMultiple, children: getLang('calls_waiting_hall_list_multiple_promote') }), children: getLang('calls_waiting_hall_list_title') }), members.map((member) => {
                const isNFT = !!member.is_nft;
                const name = getUserName(member);
                return (_jsx(SimpleCell, { after: _jsxs(ButtonGroup, { children: [_jsx(Button, { mode: "outline", onClick: () => onForbid(member.peerId), children: getLang('calls_waiting_hall_list_refuse') }), _jsx(Button, { onClick: () => onPromote(member.peerId), children: getLang('calls_waiting_hall_join') })] }), before: 
                    // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/check-required-props-usage
                    _jsx(RichAvatar, { "data-testid": "calls_call_photo", gradientColor: !isNFT ? calcInitialsAvatarColor(getIdForColorCalculation(member.peerId)) : undefined, initials: getSingleLetter(name), nft: isNFT, noBorder: true, size: isNFT ? 36 : 40, src: member.photo }), hasActive: false, hasHover: false, children: getTitle(name, member.peerId, member.link) }, member.peerId));
            }), _jsx(Spacing, {})] }));
};
//# sourceMappingURL=WaitingHallListNew.js.map