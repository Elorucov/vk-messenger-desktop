import '../../ui/StickersPanel/StickersPanel.css';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { HorizontalScroll } from '../../ui/HorizontalScroll/HorizontalScroll';
import cx from 'classnames';
import { AttachSticker, } from '../../ui/AttachSticker/AttachSticker';
import { StickersPanelBotLink } from '../../ui/StickersPanelBotLink/StickersPanelBotLink';
import { CSSTransition } from 'react-transition-group';
import * as Viewer from '../../../core/model/Viewer';
import { useViewer, useFeatureFlags } from '../../hooks/misc';
import { useRouter } from '../../ui/Router/Router';
const ANIMATION_DURATION = 200;
export const StickersPanel = function StickersPanel({ className, text, isOpen, withKeywordsBotLink = true, stickers, stickerToPackMap, size, onStickerClick, onOpenStickersSuggestionsBot, }) {
    const { profileType } = useViewer();
    const isEdu = Viewer.isEdu(profileType);
    const { navigate } = useRouter();
    const [scrollWidth, setScrollWidth] = useState(0);
    const $panel = useRef(null);
    const featureFlags = useFeatureFlags();
    const isPromotedStickersDisabled = !featureFlags.vas_promoted_stickers;
    const [visibleStickers, setVisibleStickers] = useState([]);
    const onExitDone = () => {
        setVisibleStickers(stickers);
    };
    useLayoutEffect(() => {
        if (isOpen && stickers.length) {
            setVisibleStickers(stickers);
        }
    }, [stickers, isOpen]);
    useLayoutEffect(() => {
        if (!$panel.current) {
            return;
        }
        const computedStyle = getComputedStyle($panel.current);
        setScrollWidth($panel.current.clientWidth -
            parseInt(computedStyle.paddingLeft) -
            parseInt(computedStyle.paddingRight));
    }, [isOpen]);
    const withStickersKeywordsBotLink = !!visibleStickers.length &&
        onOpenStickersSuggestionsBot &&
        !isEdu &&
        withKeywordsBotLink;
    return (React.createElement(CSSTransition, { nodeRef: $panel, in: isOpen, timeout: ANIMATION_DURATION, classNames: "StickersPanel-", mountOnEnter: true, onExited: onExitDone },
        React.createElement("div", { ref: $panel, className: cx(className, 'StickersPanel'), 
            // Превентим фокусирование с поля ввода на панель
            onMouseDown: (e) => e.preventDefault() },
            React.createElement(HorizontalScroll, { className: "StickersPanel__wrapper", showArrows: true, arrowScrollStep: scrollWidth, wheelScrollStep: 200, arrowSize: "s", isVerticalScrollable: true },
                React.createElement("div", { className: "StickersPanel__list" },
                    visibleStickers.map((suggestedSticker) => {
                        const sticker = suggestedSticker.sticker;
                        /**
                         * Обработаем кейс, когда мы еще не загрузили данные по паку для стикера
                         */
                        if (suggestedSticker.loading) {
                            return (React.createElement(AttachSticker, { key: sticker.id, availableDisabledMode: true, size: size, sticker: sticker, loading: true }));
                        }
                        if (isPromotedStickersDisabled || !suggestedSticker.promoted) {
                            return (React.createElement(AttachSticker, { key: sticker.id, size: size, sticker: sticker, packId: stickerToPackMap.get(sticker.id), onClick: () => onStickerClick(sticker), availableDisabledMode: true, iconPosition: "rightInset" }));
                        }
                        const onOpenStickerPackLayer = () => {
                            const stickerPackId = stickerToPackMap.get(sticker.id);
                            if (!stickerPackId) {
                                return;
                            }
                            navigate({
                                kind: 'StickerPackProxyRoute',
                                stickerPackId,
                                externalUrl: suggestedSticker.promotedStickerPackUrl,
                                ref: `suggestion_${text}`,
                            });
                        };
                        return (React.createElement(AttachSticker, { key: sticker.id, size: size, sticker: sticker, packId: stickerToPackMap.get(sticker.id), availableDisabledMode: true, onClick: onOpenStickerPackLayer, noBackground: true, iconPosition: "rightInset" }));
                    }),
                    withStickersKeywordsBotLink && (React.createElement(StickersPanelBotLink, { size: size, onOpenStickersSuggestionsBot: onOpenStickersSuggestionsBot })))))));
};
//# sourceMappingURL=StickersPanel.js.map