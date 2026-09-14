import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getSingleLetter } from '@vkontakte-internal/calls-core';
import { RichAvatar } from '@vkontakte-internal/vkcom-kit';
import { Icon24Camera } from '@vkontakte/icons';
export function Avatar({ name, src, alt, nft = false, 'data-testid': dataTestid, gradientColor, title, badgePreset, }) {
    const letter = name ? getSingleLetter(name) : undefined;
    return (_jsxs(RichAvatar, { alt: alt ?? title ?? '', gradientColor: gradientColor, initials: letter, nft: !!nft, size: 32, src: src, "data-testid": dataTestid, children: [!src && !letter && _jsx(Icon24Camera, {}), badgePreset && _jsx(RichAvatar.BadgeWithPreset, { preset: badgePreset })] }));
}
//# sourceMappingURL=Avatar.js.map