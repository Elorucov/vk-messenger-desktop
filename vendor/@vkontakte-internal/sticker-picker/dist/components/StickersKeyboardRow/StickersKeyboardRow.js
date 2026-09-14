import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { useStore } from 'effector-react';
import { Icon12PlayCircle } from '@vkontakte/icons';
import { classNames, createArray } from '@vkontakte/vkjs';
import { useCallback, useEffect, useMemo, useRef, } from 'react';
import { Appearance, useAppearance } from '@vkontakte-internal/vkcom-kit';
import { Sticker, StickerRich, Theme, } from '@vkontakte-internal/sticker';
import { $isVisible } from '../../model/visible';
import { $stickersSize } from '../../model/stickers/variant';
import { $imageConfigs } from '../../model/stickers/imageConfigs';
import { $favoriteStickers } from '../../model/stickers/favorite';
import { $variant, StickerEmojiKeyboardVariant } from '../../model/variant';
import { $photoEditorStickers } from '../../model/stickers/photoEditor';
import { useAPI } from '../../hooks/api';
import { useStickersKeyboard } from '../../hooks/stickersKeyboard';
import { isPopUpStickersEnabled } from '../../utils/userEnv';
import styles from './StickersKeyboardRow.module.css';
const appearanceTheme = new Map([
    [Appearance.LIGHT, Theme.LIGHT],
    [Appearance.DARK, Theme.DARK],
]);
export const rowVariantModifier = {
    [StickerEmojiKeyboardVariant.WIDE]: styles.rowWide,
    [StickerEmojiKeyboardVariant.COMPACT]: styles.rowCompact,
    [StickerEmojiKeyboardVariant.REGULAR]: styles.rowRegular,
    [StickerEmojiKeyboardVariant.ADAPTIVE]: styles.rowAdaptive,
    [StickerEmojiKeyboardVariant.SMALL]: styles.rowSmall,
};
export const RECENT_STICKERS_DEFAULT_LIMIT = 32;
export const PLAY_POPUP_HOVER_TIMEOUT = 900;
export const PLAY_POPUP_LONG_TAP_TIMEOUT = 1500;
export function StickersKeyboardRow({ pack, stickers, columns, className, ...props }) {
    // TODO [react@>=19.0.0]: Заменить дженерик `T | undefined` на `T`
    const timer = useRef(undefined);
    const clearPlayPopupPreviewTimeout = useCallback(() => {
        clearTimeout(timer.current);
    }, []);
    const api = useAPI();
    const appearance = useAppearance();
    const { onPopUpPlay, noAnimation, renderAsStaticImage } = useStickersKeyboard();
    const { addToFavorite, removeFromFavorite, onStickerSend } = useStickersKeyboard();
    const variant = useStore($variant);
    const isVisible = useStore($isVisible);
    const stickersSize = useStore($stickersSize);
    const stickerImageConfigs = useStore($imageConfigs);
    const favoriteStickers = useStore($favoriteStickers);
    const photoEditorStickers = useStore($photoEditorStickers);
    const photoEditorStickerIdsWithoutVmoji = useMemo(() => new Set((photoEditorStickers || []).filter(({ vmoji }) => !vmoji).map(({ sticker_id }) => sticker_id)), [photoEditorStickers]);
    useEffect(() => {
        if (!isVisible) {
            clearPlayPopupPreviewTimeout();
        }
        return () => {
            clearPlayPopupPreviewTimeout();
        };
    }, [isVisible, clearPlayPopupPreviewTimeout]);
    const stickerClickHandler = (context, referrer = pack?.referrer) => async (e, renderedStickerImageUrl) => {
        const { isBase, rawData, isPopup } = context;
        if (isPopup) {
            clearPlayPopupPreviewTimeout();
        }
        onStickerSend(context, referrer, renderedStickerImageUrl);
        if (!isBase || !rawData) {
            return;
        }
        const cachedRecentStickers = await api.cache.recentStickers.get();
        if (!cachedRecentStickers) {
            return;
        }
        const isStickerRecent = cachedRecentStickers.findIndex(({ sticker_id }) => sticker_id === context.id) !== -1;
        if (isStickerRecent) {
            return;
        }
        const deleteCount = cachedRecentStickers.length >= RECENT_STICKERS_DEFAULT_LIMIT
            ? cachedRecentStickers.length - RECENT_STICKERS_DEFAULT_LIMIT + 1
            : 0;
        cachedRecentStickers.splice(0, deleteCount, { ...rawData, inner_type: 'base_sticker_new' });
        api.cache.recentStickers.set(cachedRecentStickers, {
            notify: false,
        });
    };
    const favoriteIconClickHandler = (sticker, isFavorite) => {
        if (pack?.isPack) {
            return;
        }
        return () => {
            if (isFavorite) {
                removeFromFavorite(sticker);
                return;
            }
            addToFavorite(sticker);
        };
    };
    const createHandlePopUpPlay = (sticker, timerMs) => (event) => {
        const { isPopup, popupLayers } = sticker;
        clearPlayPopupPreviewTimeout();
        const { relatedTarget } = event;
        /**
         * Фикс для https://jira.mvk.com/browse/VAS-8051. Не играем превью, когда снова наводим
         * на стикер, не меняя позиции курсора. Такое случается, когда стикер теряет фокус из-за наложенного на него
         * поп-ап слоя основной анимации (у него нет pointer-events: none). Но в таком кейсе, так как ноды больше нет в DOM,
         * relatedTarget почему-то ссылается на window. Тут мы проверяем данный кейс.
         */
        if (relatedTarget && !(relatedTarget instanceof HTMLElement)) {
            return;
        }
        if (isPopup && popupLayers && isPopUpStickersEnabled()) {
            timer.current = window.setTimeout(() => {
                onPopUpPlay?.(event, popupLayers);
            }, timerMs);
        }
    };
    const handleMouseLeave = () => {
        clearPlayPopupPreviewTimeout();
    };
    const items = useMemo(() => stickers?.map((sticker) => {
        if (!stickers || !stickerImageConfigs) {
            return;
        }
        const { id, isAllowed, isPopup } = sticker;
        const { items: imageConfigs, default_id } = stickerImageConfigs;
        const isFavorite = Boolean(favoriteStickers?.find(({ sticker_id }) => sticker_id === id));
        const isPhotoEditorSticker = photoEditorStickerIdsWithoutVmoji.has(id);
        const stickerProps = {
            className: styles.sticker,
            name: String(id),
            size: stickersSize,
            sticker: sticker,
            onMouseEnter: createHandlePopUpPlay(sticker, PLAY_POPUP_HOVER_TIMEOUT),
            onMouseLeave: handleMouseLeave,
            onTouchStart: createHandlePopUpPlay(sticker, PLAY_POPUP_LONG_TAP_TIMEOUT),
            onTouchEnd: handleMouseLeave,
            theme: appearanceTheme.get(appearance),
            configs: imageConfigs,
            favorite: isFavorite,
            disabled: !isAllowed,
            defaultConfigId: default_id,
            onClick: stickerClickHandler(sticker),
            noAnimation,
            renderAsStaticImage,
        };
        if (!isPhotoEditorSticker) {
            stickerProps.onFavoriteClick = favoriteIconClickHandler(sticker, isFavorite);
        }
        if (isPopup && isPopUpStickersEnabled()) {
            return (_jsx(StickerRich, { baseStickerProps: stickerProps, wrapperProps: {
                    contentClassName: styles.stickerRichIcon,
                    icon: _jsx(Icon12PlayCircle, {}),
                    iconPosition: 'rightInset',
                } }, id));
        }
        return _jsx(Sticker, { ...stickerProps }, id);
    }) ||
        createArray(columns).map((index) => (_jsx(Sticker, { className: styles.sticker, size: stickersSize }, index))), [columns, stickers, appearance, stickersSize, favoriteStickers, stickerImageConfigs]);
    return (_jsx("div", { className: classNames(styles.row, styles.rowStickers, rowVariantModifier[variant], className), ...props, children: items }));
}
//# sourceMappingURL=StickersKeyboardRow.js.map