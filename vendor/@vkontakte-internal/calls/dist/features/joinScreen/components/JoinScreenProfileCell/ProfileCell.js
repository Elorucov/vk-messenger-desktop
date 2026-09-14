import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2}],"Flex":["@vkontakte-internal/vkcom-kit",{"className":1}]} */
import { Icon16Chevron, Icon28IncognitoOutline } from '@vkontakte/icons';
import { Avatar, Flex, getColorClass, RoundedGroup, SimpleCell, Skeleton, TextClamp, } from '@vkontakte-internal/vkcom-kit';
import { classNames } from '@vkontakte/vkjs';
import { decodeHTMLEntities } from '@vkontakte-internal/vkjs/lib/emoji/HTMLEntities';
import styles from './ProfileCell.module.css';
import { CallByNameProfileType } from '../../../../constants';
const PROFILE_CELL_AVATAR_SIZE = 32;
export const ProfileCell = ({ photo, profileName, profileType, onSelectProfileClick, type, withPopup, }) => (_jsx("div", { className: styles.root, "data-testid": "calls_preview_profile_button", children: _jsx(RoundedGroup.Item, { mode: "overlay", children: _jsx(SimpleCell, { maxHeight: 48, before: _jsxs(Flex, { align: "center", noWrap: true, children: [type === CallByNameProfileType.ANONYM && (_jsx(Avatar, { size: PROFILE_CELL_AVATAR_SIZE, children: _jsx(Icon28IncognitoOutline, {}) })), type !== CallByNameProfileType.ANONYM &&
                        (photo ? (_jsx(Avatar, { size: PROFILE_CELL_AVATAR_SIZE, src: photo, alt: profileName })) : (_jsx(Skeleton, { circle: true, width: PROFILE_CELL_AVATAR_SIZE, height: PROFILE_CELL_AVATAR_SIZE })))] }), after: _jsx(Flex, { align: "center", justify: "end", noWrap: true, className: styles.chevronContainer, children: _jsx(Icon16Chevron, {}) }), subtitle: _jsx("span", { className: getColorClass('color_text_contrast'), children: profileType }), onClick: onSelectProfileClick, children: _jsxs("div", { className: classNames(styles.name, withPopup && styles.nameInPopup), children: [profileName && _jsx(TextClamp, { lines: 1, children: decodeHTMLEntities(profileName || '') }), !profileName && _jsx(Skeleton, { width: 130, height: 18 })] }) }) }) }));
//# sourceMappingURL=ProfileCell.js.map