import React, { useEffect, useRef } from 'react';
import { ContentPlaceholder } from '../../ui/ContentPlaceholder/ContentPlaceholder';
import { useBrowserEnv, useFeatureFlags, useOrganisers, } from '../../hooks/misc';
import { hasChannelsFolder } from '../../../core/model/Folder';
import { useCreateFolder } from '../../hooks/useCreateFolder';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useRouter } from '../../ui/Router/Router';
export const ChannelsFolderRoutePlaceholder = ({ setSelectedOrganiser }) => {
    const { lang, withNewChannels } = useBrowserEnv();
    const featureFlags = useFeatureFlags();
    const { navigate } = useRouter();
    const { folders } = useOrganisers();
    const snackbar = useSnackbar();
    const { createFolder } = useCreateFolder();
    const isCreateFolderPending = useRef(false);
    // На старых каналах, когда включена заглушка, не показываем плейсхолдер и не создаем папку
    const isActiveOldChannels = !withNewChannels && featureFlags.vkm_old_channels_mock;
    async function onMount() {
        if (!featureFlags.vkm_channels_folder_link) {
            return navigate({
                kind: 'MainRoute',
            });
        }
        if (isCreateFolderPending.current) {
            return;
        }
        if (hasChannelsFolder(folders)) {
            return setSelectedOrganiser({ kind: 'channelFilters', filter: 'all' });
        }
        // Не создаем папку каналов, если это старые каналы
        if (isActiveOldChannels) {
            return navigate({
                kind: 'MainRoute',
            });
        }
        try {
            isCreateFolderPending.current = true;
            await createFolder({
                // Для app_id vkcom бэк проигнорирует этот folderName, но вернет его в других app_id, например, в dev
                folderName: lang.use('me_channels_folder_route_create_folder_name'),
                folderType: 'channels',
                onCreated: () => {
                    // Возвращаемся обратно на роут папки каналов, так как папки каналов еще не было и organiser скидывал его
                    navigate({
                        kind: 'ChannelsFolderRoute',
                    });
                },
                onError: () => {
                    snackbar({
                        message: lang.use('me_channels_folder_create_error'),
                        autoClose: true,
                        duration: 4000,
                    });
                    navigate({
                        kind: 'MainRoute',
                    });
                },
            });
        }
        finally {
            isCreateFolderPending.current = false;
        }
    }
    useEffect(() => {
        onMount();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // Не показываем ContentPlaceholder, если это старые каналы
    if (isActiveOldChannels)
        return;
    return React.createElement(ContentPlaceholder, { type: "channel" });
};
//# sourceMappingURL=ChannelsFolderRoutePlaceholder.js.map