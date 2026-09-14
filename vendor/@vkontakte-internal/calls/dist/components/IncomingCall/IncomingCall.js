import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"section":["global",{"className":1}],"div":["global",{"className":1}],"footer":["global",{"className":1}]} */
import { BlurredBackground } from '../BlurredBackground/BlurredBackground';
import { CallPhoto } from '../CallPhoto/CallPhoto';
import { IncomingCallHeader } from '../IncomingCallHeader/IncomingCallHeader';
import { Icon24PictureInPictureSquareFilled } from '@vkontakte/icons';
import { classNames as cn } from '@vkontakte/vkjs';
import { useLang } from '../../hooks/useLang';
import { AppRootProvider, IconButton, TextTooltip } from '@vkontakte-internal/vkcom-kit';
export function IncomingCall({ id, photo, title, description, onCollapseCall, children, isNFT }) {
    const { getLang } = useLang();
    return (_jsx(AppRootProvider, { children: _jsxs("section", { className: "IncomingCall", "data-testid": "calls_incoming_call_modal_root", children: [_jsx(BlurredBackground, { id: id }), _jsx("div", { className: "IncomingCall__collapse", children: _jsx(TextTooltip, { text: getLang('calls_collapse'), children: _jsx(IconButton, { "data-testid": "calls_incoming_call_collapse", label: getLang('calls_collapse'), onClick: onCollapseCall, children: _jsx(Icon24PictureInPictureSquareFilled, {}) }) }) }), _jsx(IncomingCallHeader, { title: title, description: description }), _jsx(CallPhoto, { peerId: id, waves: true, photo: photo, alt: title || '', className: cn('IncomingCall__photo', { 'IncomingCall__photo--is-nft': isNFT }), isNFT: isNFT }), _jsx("footer", { className: "IncomingCall__footer", children: children })] }) }));
}
//# sourceMappingURL=IncomingCall.js.map