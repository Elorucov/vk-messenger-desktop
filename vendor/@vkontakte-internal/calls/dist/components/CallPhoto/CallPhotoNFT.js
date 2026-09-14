import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { useLayoutEffect, useState, useRef } from 'react';
import { RichAvatar } from '@vkontakte-internal/vkcom-kit';
import { isNumber } from '@vkontakte/vkjs';
import { CallPhotoBadge } from './CallPhotoBadge';
export const CallPhotoNFT = ({ showAdminBadge, showCreatorBadge, alt, src, className, size: sizeProp, dataTestId, }) => {
    const refWrap = useRef(null);
    const [size, setSize] = useState();
    const _size = isNumber(sizeProp) ? sizeProp : size;
    useLayoutEffect(() => {
        if (!refWrap.current || isNumber(sizeProp)) {
            return;
        }
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { height } = entry.contentRect;
                setSize(height);
            }
        });
        ro.observe(refWrap.current);
        return () => ro.disconnect();
    }, [sizeProp]);
    let badge;
    if (showCreatorBadge || showAdminBadge) {
        badge = _jsx(CallPhotoBadge, { type: showCreatorBadge ? 'creator' : 'admin' });
    }
    return (_jsx("div", { ref: refWrap, className: className, "data-testid": dataTestId, children: _jsx(RichAvatar, { src: src, alt: alt, size: _size, nft: true, children: badge }) }));
};
//# sourceMappingURL=CallPhotoNFT.js.map