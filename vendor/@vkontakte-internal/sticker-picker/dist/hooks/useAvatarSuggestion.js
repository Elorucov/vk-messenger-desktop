import { jsx as _jsx } from "react/jsx-runtime";
import { useStore } from 'effector-react';
import { debounce } from '@vkontakte/vkjs';
import { useCallback, useEffect } from 'react';
import { $api } from '../model/api';
import { $isVisible } from '../model/visible';
import { $avatarSuggestion } from '../model/helpHint/avatarSuggestionBanner/info';
import { $tabbarActiveTab, $tabbarActiveTabState } from '../model/tabbarActiveTab';
import { $avatarSuggestionTab, setAvatarSuggestionTab } from '../model/helpHint/avatarSuggestionBanner/tab';
import { $avatarSuggestionBannerPackIndex, setAvatarSuggestionPackIndex, } from '../model/helpHint/avatarSuggestionBanner/packIndex';
import { $avatarSuggestionIsViewed, setAvatarSuggestionIsViewed, } from '../model/helpHint/avatarSuggestionBanner/isViewed';
import { AvatarSuggestionRow } from '../components/AvatarSuggestionRow/AvatarSuggestionRow';
import { EmojiKeyboardRowBanner } from '../components/EmojiKeyboardRow/EmojiKeyboardRowBanner/EmojiKeyboardRowBanner';
import { StickerKeyboardRowBanner } from '../components/StickersKeyboardRow/StickerKeyboardRowBanner/StickerKeyboardRowBanner';
import { Tab } from '../utils/cache/types';
import { EmojiKeyboardElementType } from '../components/EmojiKeyboard/types';
import { StickersKeyboardElementType, } from '../components/StickersKeyboard/types';
import { useStickersKeyboard } from './stickersKeyboard';
import { $avatarSuggestionDisabled, setAvatarSuggestionDisabled, } from '../model/helpHint/avatarSuggestionBanner/disabled';
const DEBOUNCE_DELAY = 100;
export const useAvatarSuggestion = () => {
    const { onVmojiSuggestionClick } = useStickersKeyboard();
    const api = useStore($api);
    const isVisible = useStore($isVisible);
    const tabbarActiveTab = useStore($tabbarActiveTab);
    const avatarSuggestion = useStore($avatarSuggestion);
    const avatarSuggestionTab = useStore($avatarSuggestionTab);
    const tabbarActiveTabState = useStore($tabbarActiveTabState);
    const bannerPackIndex = useStore($avatarSuggestionBannerPackIndex);
    const avatarSuggestionIsViewed = useStore($avatarSuggestionIsViewed);
    const avatarSuggestionDisabled = useStore($avatarSuggestionDisabled);
    useEffect(() => {
        if (!isVisible) {
            setAvatarSuggestionPackIndex(null);
            setAvatarSuggestionTab(null);
            setAvatarSuggestionIsViewed(false);
            setAvatarSuggestionDisabled(false);
        }
    }, [isVisible]);
    /**
     * из-за того что при смене видимости у нас может несколько раз сформироваться rows
     * мы делаем дебаунс, чтобы запомнить позицию для крайнего рендера
     * и дальше показываем банер в этой позиции, пока не сбросим ее при скрытии клавиатуры
     */
    const debouncedSetBannerPosition = useCallback(debounce((index) => {
        setAvatarSuggestionPackIndex(index);
    }, DEBOUNCE_DELAY), []);
    /**
     * Тоже самое с табой
     */
    const debouncedSetBannerTab = useCallback(debounce((tab) => setAvatarSuggestionTab(tab), DEBOUNCE_DELAY), []);
    /**
     * Тоже самое с дезейблом показа
     */
    const debouncedSetDisabled = useCallback(debounce((disabled) => setAvatarSuggestionDisabled(disabled), DEBOUNCE_DELAY), []);
    const getAvatarSuggestionRow = (index) => {
        if (!onVmojiSuggestionClick || avatarSuggestionDisabled) {
            return null;
        }
        if (isVisible && !avatarSuggestionIsViewed && (Boolean(avatarSuggestion) || !api.cache.reloading)) {
            setAvatarSuggestionIsViewed(true);
        }
        if (!avatarSuggestion || index === null) {
            return null;
        }
        if (avatarSuggestionTab === null) {
            debouncedSetBannerTab(tabbarActiveTab);
        }
        if (bannerPackIndex === null) {
            debouncedSetBannerPosition(index);
        }
        const Component = tabbarActiveTabState.isStickersActiveTab
            ? StickerKeyboardRowBanner
            : EmojiKeyboardRowBanner;
        return _jsx(AvatarSuggestionRow, { Component: Component }, avatarSuggestion.id);
    };
    const getAvatarSuggestionStickerRow = (index, isNeedDisable = false) => {
        if ((avatarSuggestionTab && avatarSuggestionTab !== Tab.STICKERS) || tabbarActiveTab !== Tab.STICKERS) {
            return null;
        }
        /**
         * После того как задизеблили, то уже не меняем наше решение при перерисовке rows.
         * Например, когда добавили стикеры в избранные.
         */
        if (!avatarSuggestionDisabled) {
            debouncedSetDisabled(isNeedDisable);
        }
        if (isNeedDisable) {
            return null;
        }
        const element = getAvatarSuggestionRow(index);
        if (!element) {
            return null;
        }
        return {
            type: StickersKeyboardElementType.ROW,
            element,
        };
    };
    const getAvatarSuggestionEmojiRow = (index) => {
        if ((avatarSuggestionTab && avatarSuggestionTab !== Tab.EMOJI) || tabbarActiveTab !== Tab.EMOJI) {
            return null;
        }
        const element = getAvatarSuggestionRow(index);
        if (!element) {
            return null;
        }
        return {
            type: EmojiKeyboardElementType.ROW,
            element,
        };
    };
    return {
        getAvatarSuggestionStickerRow,
        getAvatarSuggestionEmojiRow,
        bannerPackIndex,
        avatarSuggestion,
        avatarSuggestionTab,
    };
};
//# sourceMappingURL=useAvatarSuggestion.js.map