import * as Folder from '../../core/model/Folder';
import { exhaustivenessCheck } from '../../core/utils/misc';
import { addConvosToFolder, getConvosByIds, insertFolders } from './State';
import { fromApiFolder } from '../converter/FolderConverter';
export const handler = (draft, action, featureFlags, envFeatureFlags) => {
    switch (action.type) {
        case 'UserCreatedFolder': {
            insertFolders(draft, [
                fromApiFolder({
                    id: action.folderId,
                    name: action.name,
                    type: action.folderType,
                    flags: Folder.convertFlags({
                        type: action.folderType,
                        hasSublist: false,
                    }),
                }),
            ], featureFlags, envFeatureFlags);
            const addedConvos = getConvosByIds(draft, action.peerIds);
            addConvosToFolder(draft, action.folderId, addedConvos);
            return [];
        }
        default:
            exhaustivenessCheck(action.type);
    }
};
//# sourceMappingURL=UserCreatedFolder.js.map