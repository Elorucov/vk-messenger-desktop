import React, { useCallback, useMemo } from 'react';
import { useRouter } from '../../ui/Router/Router';
import { useBrowserEnv, useFeatureFlags } from '../../hooks/misc';
import { Icon20GearOutline, Icon20DeleteOutline, Icon20HideOutline, Icon20CopyOutline, Icon28CopyOutline, } from '@vkontakte/icons';
import { ActionsMenu, ActionsMenuAction, ActionsMenuSeparator, } from '../../ui/ActionsMenu/ActionsMenu';
import { MVK_DOMAINS, VK_DOMAINS, WEB_VK_ME_DOMAIN } from '../../../core/config/config';
import { CHANNELS_BASE_PATH } from '../../../core/model/Channel';
import { copyTextToClipboard } from '@vkontakte/vkjs';
import { useSnackbar } from '../../hooks/useSnackbar';
import { isDev } from '../../../core/utils/misc';
export const OrganiserActionMenu = ({ item, isFolder, isRecommendedFolder, isChannelFolder, onDelete, }) => {
    const { navigate } = useRouter();
    const { lang } = useBrowserEnv();
    const { vkm_channels_folder_link, vkm_remove_hide_channel_folder } = useFeatureFlags();
    const snackbar = useSnackbar();
    const handleEditAction = useCallback((organiser) => {
        if (organiser.kind === 'folders') {
            navigate({
                kind: 'EditFolderModal',
                folderId: organiser.id,
            });
        }
    }, [navigate]);
    const handleNavigateToFolderSettings = useCallback(() => {
        navigate({
            kind: 'SettingsRoute',
            section: 'folders',
        });
    }, [navigate]);
    const handleCopyChannelsFolderAction = useCallback(() => {
        copyTextToClipboard(getChannelsFolderUrl()).then(() => {
            snackbar({
                message: lang.use('me_folder_link_copied_snackbar'),
                before: React.createElement(Icon28CopyOutline, { color: "var(--vkui--color_text_link)" }),
            });
        });
    }, [lang, snackbar]);
    const filterActions = useMemo(() => [
        React.createElement(ActionsMenuAction, { onClick: handleNavigateToFolderSettings, leftIcon: React.createElement(Icon20GearOutline, { fill: "var(--vkui--color_icon_secondary)" }), title: lang.use('me_organiser_folders_configure_action'), "aria-label": lang.use('me_organiser_folders_configure_action') }),
    ], [lang, handleNavigateToFolderSettings]);
    const folderActions = useMemo(() => [
        React.createElement(ActionsMenuAction, { onClick: () => handleEditAction(item), title: lang.use('me_organiser_folder_configure_action'), "aria-label": lang.use('me_organiser_folder_configure_action'), leftIcon: React.createElement(Icon20GearOutline, { fill: "var(--vkui--color_icon_secondary)" }) }),
        React.createElement(ActionsMenuSeparator, null),
        React.createElement(ActionsMenuAction, { onClick: onDelete, type: "danger", leftIcon: isRecommendedFolder ? (React.createElement(Icon20HideOutline, { fill: "var(--vkui--color_text_negative)" })) : (React.createElement(Icon20DeleteOutline, { fill: "var(--vkui--color_text_negative)" })), title: lang.use(isRecommendedFolder
                ? 'me_organiser_folder_hide_action'
                : 'me_organiser_folder_delete_action'), "aria-label": lang.use(isRecommendedFolder
                ? 'me_organiser_folder_hide_action'
                : 'me_organiser_folder_delete_action') }),
    ], [lang, item, isRecommendedFolder, onDelete, handleEditAction]);
    const channelsFolderActions = useMemo(() => {
        const actions = [];
        if (vkm_channels_folder_link) {
            actions.push(React.createElement(ActionsMenuAction, { onClick: () => handleCopyChannelsFolderAction(), title: lang.use('me_organiser_folder_copy_link_action'), "aria-label": lang.use('me_organiser_folder_copy_link_action'), leftIcon: React.createElement(Icon20CopyOutline, { fill: "var(--vkui--color_icon_secondary)" }) }));
        }
        if (!vkm_remove_hide_channel_folder) {
            if (actions.length) {
                actions.push(React.createElement(ActionsMenuSeparator, null));
            }
            actions.push(React.createElement(ActionsMenuAction, { onClick: onDelete, type: "danger", leftIcon: React.createElement(Icon20DeleteOutline, { fill: "var(--vkui--color_text_negative)" }), title: lang.use('me_organiser_folder_delete_action'), "aria-label": lang.use('me_organiser_folder_delete_action') }));
        }
        return actions;
    }, [
        lang,
        vkm_channels_folder_link,
        vkm_remove_hide_channel_folder,
        handleCopyChannelsFolderAction,
        onDelete,
    ]);
    const actions = useMemo(() => {
        if (isChannelFolder) {
            return channelsFolderActions;
        }
        if (isFolder) {
            return folderActions;
        }
        return filterActions;
    }, [
        isFolder,
        isChannelFolder,
        channelsFolderActions,
        folderActions,
        filterActions,
    ]);
    if (!actions.length) {
        return null;
    }
    return React.createElement(ActionsMenu, null, actions);
};
function getChannelsFolderUrl() {
    const hostname = window.location.hostname;
    let imPath = '/im';
    switch (true) {
        // vk.com
        case VK_DOMAINS.includes(hostname):
            imPath = '/im';
            break;
        // web.vk.me и dev
        case hostname === WEB_VK_ME_DOMAIN ||
            hostname.includes('.me.cs7777') ||
            isDev:
            imPath = '';
            break;
        // mvk
        case MVK_DOMAINS.includes(hostname) || hostname.includes('.m.cs7777'):
            imPath = '/mail';
            break;
        default:
            break;
    }
    return `${window.location.origin}${imPath}${CHANNELS_BASE_PATH}`;
}
//# sourceMappingURL=OrganiserActionMenu.js.map