import { jsx as _jsx } from "react/jsx-runtime";
import { StoreButton } from '@vkontakte-internal/vkcom-kit';
export function AppDownloadBannerRow({ link, storeIcon, onClick, linkLabel, qrLabel, }) {
    return (_jsx(StoreButton, { href: link, target: "_blank", rel: "noreferrer", stretched: true, "aria-label": linkLabel, qrLabel: qrLabel, showQR: true, onQRClick: onClick, children: storeIcon }));
}
//# sourceMappingURL=AppDownloadBannerRow.js.map