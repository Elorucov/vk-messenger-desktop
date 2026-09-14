import { jsx as _jsx } from "react/jsx-runtime";
import { Sticker } from '../Sticker/Sticker';
import { PopupWrapper } from './components/PopupWrapper/PopupWrapper';
import { Wrapper } from './components/Wrapper/Wrapper';
import { getStickerContext } from '../../context/sticker/getStickerContext';
import { getDefaultIcon } from './lib/getDefaultIcon';
export function StickerRich({ baseStickerProps, wrapperProps, popupProps }) {
    const { sticker } = baseStickerProps;
    const context = getStickerContext(sticker);
    baseStickerProps.sticker = context;
    wrapperProps.icon ??= getDefaultIcon(sticker);
    const base = _jsx(Sticker, { ...baseStickerProps });
    const { isUGC, isPopup } = context;
    if (isPopup) {
        return (_jsx(PopupWrapper, { wrapperProps: wrapperProps, ...popupProps, children: base }));
    }
    if (isUGC) {
        return _jsx(Wrapper, { ...wrapperProps, children: base });
    }
    return base;
}
//# sourceMappingURL=StickerRich.js.map