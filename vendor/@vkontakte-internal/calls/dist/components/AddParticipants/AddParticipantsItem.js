import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Icon20CheckCircleOff, Icon20CheckCircleOn } from '@vkontakte/icons';
import { calcInitialsAvatarColor, Flex, getColorClass, RichAvatar, SimpleCell, Skeleton, Spinner, } from '@vkontakte-internal/vkcom-kit';
import { getSingleLetter } from '../../helpers/participant';
import { getIdForColorCalculation, getUserName } from '../../helpers/user';
export const DEFAULT_HEIGHT = 48;
export function AddParticipantsItem({ data, height = DEFAULT_HEIGHT, isDisabled, isLoading, isMoreButtonDisabled, isSelected, member, onClick, }) {
    if (data) {
        switch (data.type) {
            case "more" /* AddParticipantsItemDataType.MORE */:
                return (_jsx(SimpleCell, { disabled: isMoreButtonDisabled, disableOpacity: isMoreButtonDisabled, height: height, multiline: true, onClick: onClick, children: _jsx(Flex, { className: getColorClass('color_text_link'), justify: "center", children: isLoading ? _jsx(Spinner, { size: "small" }) : data.text }) }));
            case "not_found" /* AddParticipantsItemDataType.NOT_FOUND */:
                return (_jsx(SimpleCell, { height: height, multiline: true, children: _jsx(Flex, { className: getColorClass('color_text_secondary'), justify: "center", children: data.text }) }));
            default:
                return null;
        }
    }
    const name = getUserName(member);
    return (_jsx(SimpleCell, { before: _jsxs(Flex, { align: "center", gap: 16, noWrap: true, children: [isSelected ? (_jsx(Icon20CheckCircleOn, {})) : (_jsx(Icon20CheckCircleOff, { className: getColorClass('color_icon_tertiary') })), _jsx(RichAvatar, { alt: name, "data-testid": "calls_call_photo", gradientColor: !member.is_nft ? calcInitialsAvatarColor(getIdForColorCalculation(member.peerId)) : undefined, initials: getSingleLetter(name), nft: member.is_nft, noBorder: true, size: 40, src: member.photo })] }), "data-id": member.peerId, disabled: isDisabled, disableOpacity: isDisabled, height: height, onClick: onClick, children: _jsx("span", { className: getColorClass('color_text_link'), "data-testid": "calls_participant_list_item_name", children: name || _jsx(Skeleton, { width: 100, height: 15 }) }) }));
}
//# sourceMappingURL=AddParticipantsItem.js.map