import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"VKUIImageBase":["@vkontakte/vkui",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { ImageBase as VKUIImageBase, } from '@vkontakte/vkui';
import { ImageBaseOverlayItem } from './ImageBaseOverlayItem/ImageBaseOverlayItem';
const ImageBaseOverlay = ({ disableInteractive, onClick, children, ...restProps }) => {
    if (disableInteractive || !onClick) {
        return _jsx(VKUIImageBase.Overlay, { ...restProps, children: children });
    }
    return (_jsx(VKUIImageBase.Overlay, { onClick: onClick, ...restProps, children: children }));
};
const ImageBaseComponent = ({ className, ...restProps }) => {
    return (_jsx(VKUIImageBase
    // TODO [@vkontakte/vkui@>=8.0.0]: vkuiInternalImageBase используется в ImageBase.OverlayItem https://github.com/VKCOM/VKUI/issues/6924
    , { 
        // TODO [@vkontakte/vkui@>=8.0.0]: vkuiInternalImageBase используется в ImageBase.OverlayItem https://github.com/VKCOM/VKUI/issues/6924
        className: classNames(className, 'vkuiInternalImageBase'), ...restProps }));
};
export const ImageBase = Object.assign(ImageBaseComponent, {
    Badge: VKUIImageBase.Badge,
    Overlay: ImageBaseOverlay,
    OverlayItem: ImageBaseOverlayItem,
});
//# sourceMappingURL=ImageBase.js.map