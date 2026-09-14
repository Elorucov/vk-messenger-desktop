import * as Tag from '../../core/model/Tag';
import { exhaustivenessCheck } from '../../core/utils/misc';
import { setTags } from '../store/State';
import { fromApiTag } from '../converter/TagConverter';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'TagsCreated': {
            setTags(draft, action.tags.map((item) => fromApiTag(item)));
            return [];
        }
        case 'TagsUpdated': {
            const updatesMap = action.updates.reduce((acc, tag) => {
                acc.set(tag.id, tag.name);
                return acc;
            }, new Map());
            for (const tag of draft.organisers.tags.items) {
                if (!updatesMap.size) {
                    break;
                }
                const update = updatesMap.get(tag.id);
                if (!update) {
                    continue;
                }
                Tag.setName(tag, update);
                updatesMap.delete(tag.id);
            }
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=TagsChanges.js.map