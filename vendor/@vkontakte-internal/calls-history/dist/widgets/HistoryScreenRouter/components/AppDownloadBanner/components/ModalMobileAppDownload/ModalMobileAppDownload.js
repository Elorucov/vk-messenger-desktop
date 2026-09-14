import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Flex":["@vkontakte-internal/vkcom-kit",{"className":2}]} */
import { useLangs } from '@vkontakte-internal/plugins';
import { AppMarket } from '../../../../../../types';
import styles from './ModalMobileAppDownload.module.css';
import { ModalBox, ModalDismissButton, QRCode, Flex, Title, Text } from '@vkontakte-internal/vkcom-kit';
import { ModalBackdrop, ModalPortalToBody, OS } from '@vkontakte-internal/calls-core';
export const ModalMobileAppDownload = ({ onClose, appMarket }) => {
    const langs = useLangs();
    const platform = appMarket === AppMarket.APP_STORE ? OS.IOS : OS.ANDROID;
    const getPlatformText = () => {
        switch (platform) {
            case OS.IOS: {
                return langs.getLang('calls_application_for_ios');
            }
            case OS.ANDROID: {
                return langs.getLang('calls_application_for_android');
            }
        }
    };
    const qrUrl = (() => {
        switch (appMarket) {
            case AppMarket.APP_STORE: {
                return 'https://apps.apple.com/app/id564177498';
            }
            case AppMarket.RU_STORE: {
                return 'https://apps.rustore.ru/app/com.vkontakte.android';
            }
            case AppMarket.GOOGLE_PLAY: {
                return 'https://play.google.com/store/apps/details?id=com.vkontakte.android';
            }
        }
    })();
    return (_jsx(ModalPortalToBody, { children: _jsx(ModalBackdrop, { onClose: onClose, children: _jsxs(ModalBox, { "aria-label": getPlatformText(), width: 400, children: [_jsx(ModalDismissButton, { onClick: onClose, children: "close" }), _jsxs(Flex, { direction: "column", justify: "center", align: "center", gap: "m", className: styles.wrap, children: [_jsx(QRCode, { text: qrUrl, size: 186 }), _jsxs(Flex, { gap: "l", direction: "column", align: "center", justify: "center", className: styles.text, children: [_jsx(Title, { level: "3", children: getPlatformText() }), _jsx(Text, { children: langs.getLang('calls_scan_qr_offer') })] })] })] }) }) }));
};
//# sourceMappingURL=ModalMobileAppDownload.js.map