import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IconNewLogoVkTextColor28h, Icon40AppStoreButtonEn, Icon40AppStoreButtonRu, Icon40GooglePlayButtonEn, Icon40GooglePlayButtonRu, Icon40RustoreButtonEn, Icon40RustoreButtonRu, } from '@vkontakte-internal/icons-private';
import { Div, Flex, Footnote, getColorClass, Group, Paragraph, Spacing } from '@vkontakte-internal/vkcom-kit';
import { AppDownloadBannerRow, DownloadButtons, ModalMobileAppDownload } from './components';
import { useLangs } from '@vkontakte-internal/plugins';
import { useDownloadModal } from './hooks';
import { LINK_GOOGLE_PLAY, LINK_IOS, LINK_RUSTORE } from './constants';
import { AppMarket } from '../../../../types';
export function AppDownloadBanner() {
    const langs = useLangs();
    const { openedModal, openModal, closeModal } = useDownloadModal();
    return (_jsx(Group, { children: _jsxs(Div, { children: [_jsx(Flex, { noWrap: true, align: "center", children: _jsx(IconNewLogoVkTextColor28h, {}) }), _jsx(Spacing, { mode: "horizontal", size: 18 }), _jsx(Paragraph, { children: langs.getLang('calls_history_desktop_banner_description') }), _jsx(Spacing, { mode: "horizontal", size: 10 }), _jsx(Footnote, { children: langs.getLang('calls_history_desktop_banner_sub_description') }), _jsx(Spacing, { mode: "horizontal", size: 20 }), _jsx(Footnote, { className: getColorClass('color_text_subhead'), children: langs.getLang('calls_app_for_mobile') }), _jsx(Spacing, { mode: "horizontal", size: 12 }), _jsxs(Flex, { direction: "column", gap: [0, 12], children: [_jsx(AppDownloadBannerRow, { link: LINK_IOS, linkLabel: langs.getLang('calls_download_in_appstore'), qrLabel: langs.getLang('calls_show_ios_app_qr'), storeIcon: getAppStoreIcon(langs.locale), onClick: () => openModal(AppMarket.APP_STORE) }), _jsx(AppDownloadBannerRow, { link: LINK_GOOGLE_PLAY, linkLabel: langs.getLang('calls_download_from_google_play'), qrLabel: langs.getLang('calls_show_android_app_qr'), storeIcon: getGooglePlayIcon(langs.locale), onClick: () => openModal(AppMarket.GOOGLE_PLAY) }), _jsx(AppDownloadBannerRow, { link: LINK_RUSTORE, linkLabel: langs.getLang('calls_available_in_rustore'), qrLabel: langs.getLang('calls_show_android_app_qr'), storeIcon: getRuStoreIcon(langs.locale), onClick: () => openModal(AppMarket.RU_STORE) })] }), _jsx(Spacing, { mode: "horizontal", size: 20 }), _jsx(Footnote, { className: getColorClass('color_text_subhead'), children: langs.getLang('calls_app_for_desktop') }), _jsx(Spacing, { mode: "horizontal", size: 12 }), _jsx(DownloadButtons, {}), openedModal && _jsx(ModalMobileAppDownload, { appMarket: openedModal, onClose: closeModal })] }) }));
}
function getAppStoreIcon(locale) {
    return locale === 'ru' ? _jsx(Icon40AppStoreButtonRu, {}) : _jsx(Icon40AppStoreButtonEn, {});
}
function getGooglePlayIcon(locale) {
    return locale === 'ru' ? _jsx(Icon40GooglePlayButtonRu, {}) : _jsx(Icon40GooglePlayButtonEn, {});
}
function getRuStoreIcon(locale) {
    return locale === 'ru' ? _jsx(Icon40RustoreButtonRu, {}) : _jsx(Icon40RustoreButtonEn, {});
}
//# sourceMappingURL=AppDownloadBanner.js.map