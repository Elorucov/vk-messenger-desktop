import { combine, sample } from 'effector';
import { stickersEmojiKeyboard } from './domain.js';
import { $api, changeAPIOptions } from './api';
import { Tab } from '../utils/cache/types';
export const setTabbarActiveTab = stickersEmojiKeyboard.createEvent();
export const $tabbarActiveTab = stickersEmojiKeyboard
    .createStore(Tab.EMOJI)
    .on(setTabbarActiveTab, (_, tab) => tab);
export const $tabbarActiveTabState = combine($tabbarActiveTab, (activeTab) => ({
    isEmojiActiveTab: activeTab === Tab.EMOJI,
    isStickersActiveTab: activeTab === Tab.STICKERS,
}));
sample({
    clock: changeAPIOptions,
    source: $api,
    fn: (api) => api.cache.tabbarActiveTab.get() || Tab.EMOJI,
    target: setTabbarActiveTab,
});
//# sourceMappingURL=tabbarActiveTab.js.map