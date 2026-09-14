import React, { useEffect, useMemo, useState } from 'react';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import { Avatar, Button } from '@vkontakte/vkui';
import { Icon24FolderOutline } from '@vkontakte/icons';
import { FieldGroup, FieldGroupItem } from '../../ui/FieldGroup/FieldGroup';
import { useCreateFolder } from '../../hooks/useCreateFolder';
export const FoldersRecommended = ({ folders, recommendedFolders, onCreate, }) => {
    const dispatch = useDispatch();
    const { lang } = useBrowserEnv();
    const { createFolder, isLoading: isCreating } = useCreateFolder();
    const [busyFolderType, setBusyFolderType] = useState();
    const handleCreate = (folder) => {
        setBusyFolderType(folder.type);
        createFolder({ folderName: folder.name, folderType: folder.type });
    };
    useEffect(() => {
        dispatch({ type: 'LoadRecommendedFolders' });
    }, [dispatch]);
    useEffect(() => {
        const createdFolder = busyFolderType
            ? folders.find((f) => f.type === busyFolderType)
            : undefined;
        if (!isCreating && busyFolderType) {
            if (createdFolder) {
                onCreate(createdFolder.id);
            }
            setBusyFolderType(undefined);
        }
    }, [busyFolderType, isCreating, onCreate, folders]);
    // Фильтруем рекомендованные папки, если таковые уже созданы
    const foldersFiltered = useMemo(() => recommendedFolders.filter((f) => !f.isHidden && !folders.find((folder) => folder.type === f.type)), [folders, recommendedFolders]);
    if (!foldersFiltered.length) {
        return null;
    }
    return (React.createElement(FieldGroup, { title: lang.use('me_recommendations') }, foldersFiltered.map((folder) => (React.createElement(FieldGroupItem, { key: folder.type, before: React.createElement(Avatar, { noBorder: true, size: 40, fallbackIcon: React.createElement(Icon24FolderOutline, null) }), after: React.createElement(Button, { size: "s", mode: "secondary", appearance: "accent", disabled: isCreating, loading: folder.type === busyFolderType, onClick: () => handleCreate(folder) }, lang.use('me_add')) }, folder.name)))));
};
//# sourceMappingURL=FoldersRecommended.js.map