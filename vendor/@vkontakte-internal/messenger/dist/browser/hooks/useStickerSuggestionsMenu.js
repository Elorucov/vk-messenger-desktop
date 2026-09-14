import { useEffect, useMemo, useState, useRef } from 'react';
import { useDebounced, useDispatch, useFeatureFlags } from '../hooks/misc';
import * as Sticker from '../../core/model/Sticker';
import { escapeRegex, debounce } from '../../core/utils/misc';
import { stringEmojiRegExps } from '../ui/ComposerStickerSuggestionsMenu/emojiConstants';
import { enRuKeysMap } from '../utils/misc';
import { emojiByteHexToSymbol, emojiRemoveSkinToneModifiers, } from '../ui/ComposerStickerSuggestionsMenu/emojiUtils';
import { useStickersApi } from '../ui/StickersApiContext/StickersApiContext';
const HELLO_KEYWORD = 'привет';
const BIRTHDAY_EMOJIS = ['🎁', '🥳', '🎉', '🎊', '✨', '🎂'];
const REPLY_ON_CLIP_EMOJIS = ['😂', '❤', '👍', '🔥', '💩', '😭'];
const REPLY_ON_POST_EMOJIS = ['❤', '😁', '🔥', '😂', '😱', '👍'];
export const useStickerSuggestionsMenu = ({ text, hasBirthdayBanner, withOnlyBirthdayStickers, withOnlyReplyOnClipStickers, withOnlyReplyOnPostStickers, stickers, stickersByKeywords, isEmptyConvo, isNewConvo, isDisabled = false, onStickerSend, }) => {
    const featureFlags = useFeatureFlags();
    const isPromotedStickersDisabled = !featureFlags.vas_promoted_stickers;
    const [isVisible, setVisible] = useState(false);
    const dispatch = useDispatch();
    const stickersApi = useStickersApi();
    const { debounced: debouncedText } = useDebounced(text, 200);
    const handleStickerSend = useMemo(() => debounce((sticker) => {
        setVisible(false);
        onStickerSend(sticker);
    }, 500, true), [onStickerSend]);
    const birthdayStickers = useMemo(() => {
        if (typeof featureFlags.vkm_birthday_sticker_pack === 'boolean') {
            return [];
        }
        return featureFlags.vkm_birthday_sticker_pack;
    }, [featureFlags.vkm_birthday_sticker_pack]);
    const { suggestedStickerIds, stickerToPackMap } = useMemo(() => {
        const stickerToPackMap = new Map();
        if (withOnlyReplyOnClipStickers || withOnlyReplyOnPostStickers) {
            const emojis = withOnlyReplyOnClipStickers
                ? REPLY_ON_CLIP_EMOJIS
                : REPLY_ON_POST_EMOJIS;
            const ids = [
                ...emojis
                    .map((emoji) => {
                    const stickersForEmoji = stickersByKeywords.get(emoji) || [];
                    const stickersForEmojiAvailable = stickersForEmoji.filter((item) => stickers.get(item.id)?.item.is_allowed);
                    return stickersForEmojiAvailable.length > 0
                        ? stickersForEmojiAvailable.slice(0, 1)
                        : [];
                })
                    .flat()
                    .map(({ id }) => id),
            ];
            return {
                suggestedStickerIds: [...new Set(ids)],
                stickerToPackMap,
            };
        }
        // По задаче https://jira.mvk.com/browse/ME-56118 если у участника группового чата есть др,
        // то подбираем ему стикеры по нескольким эмодзи
        if (withOnlyBirthdayStickers) {
            const birthdayVariants = BIRTHDAY_EMOJIS.reduce((acc, current) => {
                acc.push(...getInputVariants(current));
                return acc;
            }, []);
            const birthdayStickersIds = [
                ...birthdayVariants
                    .map((textVariant) => stickersByKeywords.get(textVariant) || [])
                    .flat()
                    .map(({ id }) => id),
                ...birthdayStickers,
            ];
            return {
                suggestedStickerIds: [...new Set(birthdayStickersIds)],
                stickerToPackMap,
            };
        }
        const textVariants = getInputVariants(debouncedText);
        if (isEmptyConvo && textVariants.length === 0) {
            const helloStickerIds = [
                ...getInputVariants(HELLO_KEYWORD)
                    .map((textVariant) => stickersByKeywords.get(textVariant) || [])
                    .flat()
                    .map(({ id }) => id),
                ...featureFlags.me_sticker_packs.helloKeywordPack,
                ...(isNewConvo ? featureFlags.me_sticker_packs.helloStickersPack : []),
            ];
            return {
                suggestedStickerIds: [...new Set(helloStickerIds)],
                stickerToPackMap,
            };
        }
        const seen = new Set();
        const suggestedStickerIds = textVariants
            .map((textVariant) => stickersByKeywords.get(textVariant) || [])
            .flat()
            .filter((sticker) => {
            const duplicate = seen.has(sticker.id);
            seen.add(sticker.id);
            return !duplicate;
        });
        for (const { id, packId } of suggestedStickerIds) {
            stickerToPackMap.set(id, packId);
        }
        return {
            suggestedStickerIds: suggestedStickerIds.map(({ id }) => id),
            stickerToPackMap,
        };
    }, [
        stickers,
        withOnlyReplyOnClipStickers,
        withOnlyReplyOnPostStickers,
        withOnlyBirthdayStickers,
        debouncedText,
        isEmptyConvo,
        birthdayStickers,
        featureFlags.me_sticker_packs.helloKeywordPack,
        featureFlags.me_sticker_packs.helloStickersPack,
        stickersByKeywords,
        isNewConvo,
    ]);
    const unloadedStickerIds = useMemo(() => {
        const unloadedStickers = [];
        for (const stickerId of suggestedStickerIds) {
            const resolvedStickerId = Sticker.resolveStickerId(stickerId);
            const sticker = stickers.get(resolvedStickerId);
            if (!sticker) {
                unloadedStickers.push(resolvedStickerId);
            }
        }
        return unloadedStickers;
    }, [suggestedStickerIds, stickers]);
    useEffect(() => {
        if (isPromotedStickersDisabled) {
            return;
        }
        // Не все нужные стикеры могут быть в памяти
        const getUnloadedStickers = () => {
            // Загрузим недостающие в кеш и в память
            if (unloadedStickerIds.length) {
                stickersApi.cache.getStickers(unloadedStickerIds).then((stickers) => {
                    dispatch({
                        type: 'StickersCacheReceived',
                        stickers,
                    });
                });
            }
        };
        getUnloadedStickers();
    }, [
        dispatch,
        stickersApi.cache,
        isPromotedStickersDisabled,
        unloadedStickerIds,
    ]);
    const [suggestedStickers, setSuggestedStickers] = useState([]);
    const $lastSuggestion = useRef(debouncedText);
    useEffect(() => {
        const initSuggestedStickers = async () => {
            $lastSuggestion.current = debouncedText;
            if (!suggestedStickerIds.length) {
                setSuggestedStickers([]);
                return;
            }
            // найдем стикеры в памяти по айдишникам
            const stickerItems = [];
            const promotedLoadingStickerIds = [];
            for (const stickerId of suggestedStickerIds) {
                const resolvedStickerId = Sticker.resolveStickerId(stickerId);
                const sticker = stickers.get(resolvedStickerId);
                if (sticker) {
                    stickerItems.push(sticker);
                }
                else {
                    promotedLoadingStickerIds.push(resolvedStickerId);
                }
            }
            // идем в кеш, чтобы проверить, добавлен/куплен пак
            const stockItems = await stickersApi.cache.stockItems.get();
            if (!stockItems) {
                // не удалось получить сток айтемы из кеша
                return;
            }
            // Запрос к кешу устарел
            if (debouncedText !== $lastSuggestion.current) {
                return;
            }
            setSuggestedStickers(composeHints(stickerItems, promotedLoadingStickerIds, stockItems, featureFlags.vas_promoted_shuffling));
        };
        initSuggestedStickers();
    }, [
        stickers,
        stickersApi.cache,
        suggestedStickerIds,
        debouncedText,
        featureFlags.vas_promoted_shuffling,
    ]);
    useEffect(() => {
        setVisible(!isDisabled && !!suggestedStickers.length);
    }, [isDisabled, suggestedStickers.length]);
    useEffect(() => {
        if (!hasBirthdayBanner && !isEmptyConvo) {
            return;
        }
        const unloadedStickers = [];
        if (isEmptyConvo) {
            const helloStickers = Object.values(featureFlags.me_sticker_packs).flat();
            unloadedStickers.push(...helloStickers.filter((id) => !stickers.has(Sticker.resolveStickerId(id))));
        }
        if (hasBirthdayBanner) {
            unloadedStickers.push(...birthdayStickers.filter((id) => !stickers.has(Sticker.resolveStickerId(id))));
        }
        if (!unloadedStickers.length) {
            return;
        }
        stickersApi.cache.getStickers(unloadedStickers).then((stickers) => {
            dispatch({
                type: 'StickersCacheReceived',
                stickers,
            });
        });
    }, [
        birthdayStickers,
        dispatch,
        featureFlags.me_sticker_packs,
        hasBirthdayBanner,
        isEmptyConvo,
        stickers,
        stickersApi.cache,
    ]);
    return {
        isVisible,
        setVisible,
        suggestedStickers,
        stickerToPackMap,
        sendSticker: handleStickerSend,
    };
};
function isPromotedStickerPosition(index, strategy) {
    const everyN = (n) => !n || (!!index && !((index + 1) % n));
    switch (strategy) {
        case 1: {
            return index === 3;
        }
        case 2: {
            return everyN(4);
        }
        default: {
            return false;
        }
    }
}
function prepareHints(stickerItems, promotedLoadingStickerIds, stockItems) {
    const promoted = [];
    const active = [];
    for (const stickerId of promotedLoadingStickerIds) {
        promoted.push({
            promoted: true,
            loading: true,
            sticker: {
                id: stickerId,
                kind: 'Sticker',
                item: {
                    sticker_id: stickerId,
                    inner_type: 'base_sticker_new',
                    is_allowed: false,
                },
                isPopupAutoplayed: false,
            },
        });
    }
    for (const sticker of stickerItems) {
        // находим пак из кеша
        const pack = stockItems.find((stockItem) => {
            return stockItem.product.stickers?.some((stockItemSticker) => stockItemSticker.sticker_id === sticker.id);
        });
        // фильтруем купленные, но неактивные
        if (pack && !pack.product.active) {
            continue;
        }
        // сохраняем признак, что пак уже куплен/добавлен
        const isPromoted = !pack;
        if (isPromoted) {
            promoted.push({
                sticker,
                promoted: true,
                promotedStickerPackUrl: sticker?.item.pack_url,
            });
        }
        else {
            active.push({
                sticker,
                promoted: false,
            });
        }
    }
    return { active, promoted };
}
function shuffleHints(suggestedStickers, strategy) {
    const { active, promoted } = suggestedStickers;
    const result = [];
    const length = promoted.length + active.length;
    for (let i = 0; i < length; i++) {
        if (promoted.length &&
            (!active.length || isPromotedStickerPosition(i, strategy))) {
            const promotedSticker = promoted.shift();
            if (promotedSticker) {
                result.push(promotedSticker);
            }
        }
        else {
            const activeSticker = active.shift();
            if (activeSticker) {
                result.push(activeSticker);
            }
        }
    }
    return result;
}
function composeHints(stickerItems, promotedLoadingStickerIds, stockItems, strategy) {
    return shuffleHints(prepareHints(stickerItems, promotedLoadingStickerIds, stockItems), strategy);
}
const enKeysRegExp = new RegExp(`[${escapeRegex(Object.keys(enRuKeysMap).join(''))}]`, 'gi');
const convertLayoutEnRu = (input) => input.replace(enKeysRegExp, (en) => enRuKeysMap[en] || '');
const ruEnKeysMap = Object.entries(enRuKeysMap).reduce((ruEnKeysMap, [en, ru]) => {
    ruEnKeysMap[ru] = en;
    return ruEnKeysMap;
}, {});
const ruKeysRegExp = new RegExp(`[${escapeRegex(Object.keys(ruEnKeysMap).join(''))}]`, 'gi');
const convertLayoutRuEn = (input) => input.replace(ruKeysRegExp, (ru) => ruEnKeysMap[ru] || '');
/**
 * Функция возвращает различные варианты написания текста,
 * заменяет text emoji (ex: '<3', ':-)', ':like:', ...) на emoji,
 * удаляет emoji skin tone
 *
 * Для input 'hello :-)' => ['hello 😊', 'руддщ 😊']
 */
function getInputVariants(input, maxInputLength = 256) {
    if (!input || input.length > maxInputLength) {
        return [];
    }
    input = input.toLowerCase();
    input = stringEmojiRegExps.reduce((input, [regExp, code]) => input.replace(regExp, (match, before, stringEmoji, after) => (before || '') + emojiByteHexToSymbol(code) + (after || '')), input);
    // \uFEFF - Unicode Byte Order Mark (BOM)
    // \xA0 - non-breaking space
    input = input.replace(/^[\s\uFEFF\xA0]+|\n+$/g, '');
    input = emojiRemoveSkinToneModifiers(input);
    const queries = [input];
    for (const query of [...queries]) {
        queries.push(convertLayoutEnRu(query));
        queries.push(convertLayoutRuEn(query));
    }
    for (const query of [...queries]) {
        queries.push(query.replace(/ё/g, 'е'));
        queries.push(query.replace(/е/g, 'ё'));
    }
    for (const query of [...queries]) {
        queries.push(query.replace(/[.!?]+$/, ''));
    }
    return [...new Set(queries)];
}
//# sourceMappingURL=useStickerSuggestionsMenu.js.map