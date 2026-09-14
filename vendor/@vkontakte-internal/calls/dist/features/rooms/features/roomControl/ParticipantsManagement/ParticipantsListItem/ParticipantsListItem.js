import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Icon16MoreVertical":["@vkontakte/icons",{"className":1}],"div":["global",{"className":2}],"Cell":["@vkontakte-internal/vkcom-kit",{"className":1}]} */
import { memo } from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
import { externalIdToString } from '@vkontakte-internal/calls-core';
import { Icon16MoreVertical } from '@vkontakte/icons';
import { CallPhoto } from '../../../../../../components/CallPhoto/CallPhoto';
import { getSingleLetter } from '../../../../../../helpers/participant';
import { TOOLTIP_DELAY } from '../../../../../../constants';
import { useLang } from '../../../../../../hooks/useLang';
import { vou } from '../../../../../../helpers/helpers';
import { DropdownActionSheet, TextTooltip, Button, IconButton, Cell } from '@vkontakte-internal/vkcom-kit';
import { createMetaIcons } from './createMetaIcons';
import styles from './ParticipantsListItem.module.css';
const ParticipantsListItemComponent = ({ selectable, checked, isAdmin, isCreator, isHandRaised, isHelpRequested, participantNft, participantPeerId, participantPhoto, participantName = '', participantDisplayName, deviceExternalId, moreButtonStyle = 'icon', withMeta, actionsMore, handleChange, isAudioEnabled, isScreenSharingEnabled, isVideoEnabled, }) => {
    const { getLang } = useLang();
    const key = externalIdToString(deviceExternalId);
    const mode = vou(selectable && !isAdmin, 'selectable');
    const tooltipDelay = TOOLTIP_DELAY;
    let after;
    const subtitle = isCreator
        ? getLang('calls_room_control_participant_creator')
        : vou(isAdmin, getLang('calls_room_control_participant_admin'));
    if (!isAdmin) {
        after = (_jsx(DropdownActionSheet, { trigger: "click", placement: "bottom-end", width: 250, maxHeight: 280, offsetByMainAxis: moreButtonStyle === 'button' ? 5 : -5, content: _jsx(_Fragment, { children: actionsMore.map((action, i) => (_jsxs(_Fragment, { children: [_jsx(DropdownActionSheet.Item, { before: action.before, after: action.after, disabled: action.disabled, "data-testid": action.dataTestId, onClick: (e) => {
                                e.stopPropagation();
                                action?.handleClick?.(deviceExternalId);
                            }, children: action.text }, `device_${key}_act_${i}`), action.withSeparator && _jsx(DropdownActionSheet.Separator, {})] }))) }), children: moreButtonStyle === 'button' ? (_jsx(Button, { mode: "secondary", size: "m", "data-testid": "calls_rooms_control_participant_move_btn", children: getLang('calls_room_control_move_button') })) : (_jsx(IconButton, { hasHover: false, hasActive: false, "data-testid": "calls_rooms_control_participant_menu", label: getLang('calls_room_control_participant_tooltip_more'), children: _jsx(TextTooltip, { text: getLang('calls_room_control_participant_tooltip_more'), placement: "top", usePortal: true, offsetByMainAxis: -5, hoverDelay: tooltipDelay, children: _jsx(Icon16MoreVertical, { className: styles.contentIcon }) }) })) }));
    }
    else {
        after = _jsx("div", { className: styles.itemSpace });
    }
    return (_jsx(Cell, { mode: mode, subtitle: subtitle, checked: checked, disabled: isAdmin, onChange: () => handleChange?.(deviceExternalId), className: cx(styles.participantItem, isAdmin && styles.participantItemWithOpacity), "data-testid": "calls_rooms_control_participant", before: _jsx("div", { className: cx(styles.avatar, vou(selectable && isAdmin, styles.avatarAdmin)), children: _jsx(CallPhoto, { size: participantNft ? 36 : 40, peerId: participantPeerId, photo: participantPhoto, alt: participantName, showCreatorBadge: isCreator, showAdminBadge: isAdmin, isNFT: participantNft, letter: getSingleLetter(participantName) }) }), after: _jsxs(_Fragment, { children: [withMeta &&
                    createMetaIcons({
                        externalId: deviceExternalId,
                        isHandRaised: Boolean(isHandRaised),
                        isHelpRequested: Boolean(isHelpRequested),
                        isScreenSharingEnabled: Boolean(isScreenSharingEnabled),
                        isAudioEnabled: Boolean(isAudioEnabled),
                        isVideoEnabled: Boolean(isVideoEnabled),
                    }), after] }), children: participantDisplayName }));
};
export const ParticipantsListItem = memo(ParticipantsListItemComponent);
//# sourceMappingURL=ParticipantsListItem.js.map