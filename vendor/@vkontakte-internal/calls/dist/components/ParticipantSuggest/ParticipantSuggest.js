import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}],"CheckIcon":["@vkontakte/icons",{"className":1}]} */
import Entity from '../../palette/Entity/Entity';
import { classNames as cx } from '@vkontakte/vkjs';
import { Icon20CheckCircleOn, Icon20CheckCircleOff } from '@vkontakte/icons';
import { CallPhoto } from '../CallPhoto/CallPhoto';
import { isParticipantContact } from '../../helpers/participant';
export function ParticipantSuggest({ member, selected = false, disabled = false }) {
    const classes = cx('ParticipantSuggest', {
        'ParticipantSuggest--selected': selected,
        'ParticipantSuggest--disabled': disabled,
    });
    const CheckIcon = selected ? Icon20CheckCircleOn : Icon20CheckCircleOff;
    const isNFT = !!member.is_nft;
    // TODO CALL-21471 REMOVE TEMPORARY CONTACTS
    return (_jsxs("div", { className: classes, "data-id": isParticipantContact(member.peerId) ? member.peerId : member.id, children: [_jsx(Entity, { className: "ParticipantSuggest__entity", title: member.name, photo: _jsx(CallPhoto, { peerId: member.peerId, photo: member.photo, alt: member.name, size: isNFT ? 36 : 40, isNFT: isNFT }) }), _jsx(CheckIcon, { className: "ParticipantSuggest__checkIcon" })] }));
}
//# sourceMappingURL=ParticipantSuggest.js.map