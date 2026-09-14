import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BlurredBackground } from '../BlurredBackground/BlurredBackground';
import { CallPhoto } from '../CallPhoto/CallPhoto';
export const CallWidget = ({ id, photo, title, status, isIncoming, onClick, children, }) => (_jsxs("div", { className: "CallWidget", onClick: onClick, children: [_jsx(BlurredBackground, { id: id, className: "CallWidget__background" }), _jsx(CallPhoto, { peerId: id, photo: photo, waves: isIncoming, alt: title || '', className: "CallWidget__photo" }), _jsx("h1", { className: "CallWidget__name", children: title }), _jsx("div", { className: "CallWidget__status", children: status }), children] }));
//# sourceMappingURL=CallWidget.js.map