import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Icon16LogoApple } from '@vkontakte/icons';
import { Icon16LogoLinux, Icon16LogoWindows } from '@vkontakte-internal/icons-private';
import { download, OS, Platform, mailRuCounter, EOS, EMailRuGoals } from '@vkontakte-internal/calls-core';
import { Flex, Spacing } from '@vkontakte-internal/vkcom-kit';
import { DOWNLOAD_APP_PROXY_PAGE, DESKTOP_CALLS_FILENAME } from '../../constants';
import { AppDownloadButton } from './AppDownloadButton';
export function openDesktopPage(url) {
    const link = document.createElement('a');
    link.target = '_blank';
    link.href = url;
    document.body.appendChild(link);
    link.click();
    link.remove();
}
export function DownloadButtons() {
    const downloadMacApp = () => {
        mailRuCounter.push(EMailRuGoals.DownloadAppVkCalls, { os: EOS.Mac });
        download(DOWNLOAD_APP_PROXY_PAGE + '&type=mac', DESKTOP_CALLS_FILENAME[OS.MAC], true);
    };
    const downloadWindowsApp = () => {
        mailRuCounter.push(EMailRuGoals.DownloadAppVkCalls, { os: EOS.Windows });
        download(DOWNLOAD_APP_PROXY_PAGE + '&type=windows', DESKTOP_CALLS_FILENAME[OS.WINDOWS], true);
    };
    const downloadLinuxApp = () => {
        mailRuCounter.push(EMailRuGoals.DownloadAppVkCalls, { os: EOS.Linux });
        openDesktopPage(DOWNLOAD_APP_PROXY_PAGE + '&type=linux');
    };
    switch (Platform.OS) {
        case OS.WINDOWS: {
            return _jsx(AppDownloadButton, { icon: _jsx(Icon16LogoWindows, {}), text: "Windows", onClick: downloadWindowsApp });
        }
        case OS.MAC: {
            return _jsx(AppDownloadButton, { icon: _jsx(Icon16LogoApple, {}), text: "Mac", onClick: downloadMacApp });
        }
        case OS.LINUX: {
            return _jsx(AppDownloadButton, { icon: _jsx(Icon16LogoLinux, {}), text: "Linux", onClick: downloadLinuxApp });
        }
        default: {
            return (_jsxs(_Fragment, { children: [_jsx(AppDownloadButton, { icon: _jsx(Icon16LogoWindows, {}), text: "Windows", onClick: downloadWindowsApp }), _jsx(Spacing, { size: 8, mode: "horizontal" }), _jsxs(Flex, { direction: "row", gap: 8, children: [_jsx(AppDownloadButton, { icon: _jsx(Icon16LogoApple, {}), text: "Mac", onClick: downloadMacApp }), _jsx(AppDownloadButton, { icon: _jsx(Icon16LogoLinux, {}), text: "Linux", onClick: downloadLinuxApp })] })] }));
        }
    }
}
//# sourceMappingURL=DownloadButtons.js.map