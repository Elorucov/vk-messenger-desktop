import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"VKUIImage":["@vkontakte/vkui",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Image as VKUIImage, } from '@vkontakte/vkui';
import { ImageBase } from '../ImageBase/ImageBase';
const ImageOverlay = ({ disableInteractive, onClick, children, ...restProps }) => {
    if (disableInteractive || !onClick) {
        return _jsx(VKUIImage.Overlay, { ...restProps, children: children });
    }
    return (_jsx(VKUIImage.Overlay, { onClick: onClick, ...restProps, children: children }));
};
const ImageComponent = ({ className, ...restProps }) => {
    return (_jsx(VKUIImage
    // TODO [@vkontakte/vkui@>=8.0.0]: vkuiInternalImage используется в ImageBase.OverlayItem https://github.com/VKCOM/VKUI/issues/6924
    , { 
        // TODO [@vkontakte/vkui@>=8.0.0]: vkuiInternalImage используется в ImageBase.OverlayItem https://github.com/VKCOM/VKUI/issues/6924
        className: classNames(className, 'vkuiInternalImage'), ...restProps }));
};
export const Image = Object.assign(ImageComponent, {
    ...VKUIImage,
    Badge: VKUIImage.Badge,
    Overlay: ImageOverlay,
    OverlayItem: ImageBase.OverlayItem,
});
//# sourceMappingURL=Image.js.map