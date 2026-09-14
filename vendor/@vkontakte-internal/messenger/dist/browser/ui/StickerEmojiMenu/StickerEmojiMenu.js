import '../../ui/StickerEmojiMenu/StickerEmojiMenu.css';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState, useLayoutEffect, } from 'react';
import { POPUP_STICKER_CONTAINER_ID, StickersEmojiKeyboard as ExternalStickerEmojiMenu, } from '@vkontakte-internal/sticker-picker';
import { ColorSchemeProvider, useColorScheme } from '@vkontakte/vkui';
import { PopupStickerService } from '@vkontakte-internal/stickers-kit';
import { useBrowserEnv, useFeatureFlags, useViewer } from '../../hooks/misc';
import * as Peer from '../../../core/model/Peer';
import * as Viewer from '../../../core/model/Viewer';
import { CSSTransition } from 'react-transition-group';
import { IApi } from '../../../data/env/IApi';
import cx from 'classnames';
import { useLayer } from '../../ui/Layer/Layer';
import * as Attach from '../../../core/model/Attach';
import { UGC_STICKERS_APP_ID, VMOJI_CONSTRUCTOR_APP_ID, } from '../../../core/config/config';
import { Portal } from '../../ui/Portal/Portal';
import { setActivePackKeyOptions } from '@vkontakte-internal/sticker-picker/dist/model/stickers/packs/active';
import { useStickersApi } from '../../ui/StickersApiContext/StickersApiContext';
import { StickersPopupRootContainer } from '../../ui/StickersPopupRootContainer/StickersPopupRootContainer';
import { noop } from '../../../core/utils/misc';
const CLOSE_TIMEOUT = 200;
const OPEN_TIMEOUT = 100;
const ANIMATION_DURATION = 200;
export const StickerEmojiMenuPopper = memo(({ isOpen, toggleIsOpen, className, contentClassName, triggerClassName, children, onStickerSend, ...props }) => {
    const { stats } = useBrowserEnv();
    const [openedAt, setOpenedAt] = useState(null);
    const $menu = useRef(null);
    const $trigger = useRef(null);
    const layer = useLayer();
    const appearance = useColorScheme();
    const [сontentPositionStyles, setContentPositionStyles] = useState({
        left: '100vw',
        top: '100vh',
        position: 'fixed',
        transform: `translateX(-100%) translateY(-100%)`,
    });
    const handleStickerSend = useCallback((...args) => onStickerSend?.(...args), [onStickerSend]);
    const logTimespentOnClose = useCallback(() => {
        if (!openedAt) {
            return;
        }
        const timeSpent = performance.now() - openedAt;
        stats.logEvent({
            type: 'type_action',
            type_action: {
                type: 'type_messaging_action_item',
                type_messaging_action_item: {
                    action_type: 'sticker_menu_show_duration',
                    label: String(timeSpent),
                },
            },
        });
    }, [openedAt, stats]);
    useEffect(() => {
        const handleClickOutSide = (event) => {
            if (
            // Чтобы сошлось по типам для последующих contains
            event.target instanceof Node &&
                $menu.current &&
                !$menu.current.contains(event.target) &&
                $trigger.current &&
                !$trigger.current.contains(event.target)) {
                toggleIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutSide);
        document.addEventListener('touchstart', handleClickOutSide);
        return () => {
            document.removeEventListener('mousedown', handleClickOutSide);
            document.removeEventListener('touchstart', handleClickOutSide);
        };
    }, [toggleIsOpen]);
    useLayoutEffect(() => {
        if ($trigger.current && isOpen) {
            setOpenedAt(performance.now());
            const { right, top } = $trigger.current.getBoundingClientRect();
            const BOTTOM_SHIFT = 16; // приподнимаем повыше над композером (триггером в композере)
            setContentPositionStyles({
                // в сочетании с translateX так делаем выравнивание по правому краю
                left: right,
                top,
                position: 'fixed',
                transform: `translateX(-100%) translateY(calc(-100% - ${BOTTOM_SHIFT}px))`,
            });
        }
        else if (!isOpen) {
            logTimespentOnClose();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);
    return (React.createElement("div", { className: cx(className, 'StickerEmojiMenuPopper'), onMouseDown: (e) => {
            // Чтобы композер не терял фокус.
            // Это удобно пользователю и также чинит баг:
            // эмодзи вставляется не по месту курсора, а переводит
            // курсор в конец и вставляется в конец.
            e.preventDefault();
        }, onMouseEnter: () => toggleIsOpen(true), onMouseLeave: () => toggleIsOpen(false) },
        React.createElement("div", { className: cx(triggerClassName, 'StickerEmojiMenuPopper__trigger'), ref: $trigger }, children),
        React.createElement(ColorSchemeProvider, { value: appearance },
            React.createElement(Portal, { portalTarget: layer },
                React.createElement(CSSTransition, { nodeRef: $menu, in: isOpen, timeout: ANIMATION_DURATION, classNames: "StickerEmojiMenuPopper__content-", mountOnEnter: true, style: сontentPositionStyles },
                    React.createElement("div", { ref: $menu, className: cx(contentClassName, 'StickerEmojiMenuPopper__content') },
                        React.createElement(StickerEmojiMenu, { onStickerSend: handleStickerSend, isVisible: isOpen, ...props })))))));
});
export const StickerEmojiMenu = memo(({ className, ...props }) => {
    const viewer = useViewer();
    const { api, router, logger, vkcom_me } = useBrowserEnv();
    const { profileType, settings } = useViewer();
    const isEdu = Viewer.isEdu(profileType);
    const stickersApi = useStickersApi();
    const { vkm_stickers_popup } = useFeatureFlags();
    const popupStickersStore = useMemo(() => (vkm_stickers_popup ? new PopupStickerService() : undefined), [vkm_stickers_popup]);
    /**
     * activePackKey это айди пака стикеров, который нужно открывать извне.
     * Мы его используем, чтобы открыть определенный пак при нажатии на стикер
     * в сообщении.
     * К сожалению просто выставить null или undefined не получится, так как
     * от этого ломается то или иное поведение стикер пикера. Поэтому при
     * каждом закрытии пикера мы выставляем последний активный айдишник пака.
     */
    useEffect(() => {
        if (!props.isVisible) {
            setActivePackKeyOptions({
                activePackKey: stickersApi.cache.stickersActiveTab?.get() || undefined,
            });
        }
    }, [props.isVisible, stickersApi]);
    const handleAPIRequest = useCallback((method, params = {}) => {
        return api
            .fetchForExternalLibs(method, params, {
            timeout: 30 * 1000,
            retries: 5,
        })
            .catch((error) => {
            if (error instanceof IApi.RequestError) {
                return Promise.reject(error.apiError);
            }
            if (error instanceof IApi.ExecuteErrors) {
                return Promise.reject({
                    errors: error.list.map((err) => err.apiError),
                });
            }
            return Promise.reject(error);
        });
    }, [api]);
    const handleShopClick = useCallback(() => {
        const peerId = props.peerId && Peer.resolveAnyId(props.peerId);
        router.push({
            kind: 'StickersStoreProxyRoute',
            peerId: peerId && Peer.isUserPeerId(peerId) ? peerId : undefined,
        });
    }, [router, props.peerId]);
    const handleUGCEditClick = useCallback(() => {
        if (!props.peerId) {
            logger.error('У стикерпикера нет peerId для открытия миниаппа UGC');
            return;
        }
        router.push({
            kind: 'MiniAppModal',
            miniAppId: Attach.resolveMiniAppId(UGC_STICKERS_APP_ID),
            hash: new URLSearchParams({
                peer_id: String(props.peerId),
                ref: 'keyboard',
            }).toString(),
        });
    }, [logger, props.peerId, router]);
    const handleVmojiSuggestionClick = useCallback(() => {
        router.push({
            kind: 'MiniAppModal',
            miniAppId: Attach.resolveMiniAppId(VMOJI_CONSTRUCTOR_APP_ID),
            hash: new URLSearchParams({
                is_suggested: 'true',
                promo_id: 'vmoji_avatar_suggestion_stickers_keyboard_hint',
            }).toString(),
        });
    }, [router]);
    const handleVmojiEditClick = useCallback(({ character_id }, vmojiParams) => {
        const params = {
            character_id,
            ...vmojiParams,
        };
        // TODO: https://jira.mvk.com/browse/VAS-7259
        params.disable_share = 'true';
        router.push({
            kind: 'MiniAppModal',
            miniAppId: Attach.resolveMiniAppId(VMOJI_CONSTRUCTOR_APP_ID),
            hash: new URLSearchParams(params).toString(),
        });
    }, [router]);
    const handlePopUpPlay = (event, layers) => {
        if (!props.isVisible || !vkm_stickers_popup || !popupStickersStore) {
            return;
        }
        popupStickersStore.preparePreview({
            stickerElement: event.target,
            layers,
        });
    };
    const handleContainerClick = () => {
        popupStickersStore?.destroyWithFadeOut();
    };
    return (React.createElement(StickersPopupRootContainer, { id: POPUP_STICKER_CONTAINER_ID, isVisible: props.isVisible, popUpStore: popupStickersStore, isUseAsFullscreen: true, className: "StickerEmojiMenuPopper__popup", onClick: handleContainerClick, position: "absolute" },
        React.createElement(ExternalStickerEmojiMenu, { ...props, onPopUpPlay: handlePopUpPlay, className: cx(className, 'StickerEmojiMenu'), userId: viewer.id, onAPIRequest: handleAPIRequest, onShopClick: isEdu ? undefined : handleShopClick, onUGCEditClick: handleUGCEditClick, onVmojiEditClick: handleVmojiEditClick, onUGCReportClick: vkcom_me?.onUGCReportClick, onVmojiCreateClick: vkcom_me?.onVmojiCreateClick, onVmojiSuggestionClick: handleVmojiSuggestionClick, onStockItemGiftClick: vkcom_me?.onStockItemGiftClick, onStockItemSettingsClick: vkcom_me?.onStockItemSettingsClick, noAnimation: !settings.isStickersAnimationEnabled })));
});
export const useStickerEmojiMenuPopper = () => {
    const $isOpen = useRef(false);
    const openCloseTimeout = useRef();
    const [isOpen, setIsOpen] = useState(false);
    const toggleIsOpen = useCallback((newIsOpen, withTimeout = true, onToggle = noop) => {
        if (newIsOpen !== $isOpen.current) {
            window.clearTimeout(openCloseTimeout.current);
        }
        $isOpen.current = newIsOpen;
        openCloseTimeout.current = window.setTimeout(() => {
            setIsOpen(newIsOpen);
            onToggle();
            openCloseTimeout.current = undefined;
        }, withTimeout ? (newIsOpen ? OPEN_TIMEOUT : CLOSE_TIMEOUT) : 0);
    }, []);
    useEffect(() => () => {
        window.clearTimeout(openCloseTimeout.current);
    }, []);
    return useMemo(() => ({
        isOpen,
        toggleIsOpen,
    }), [isOpen, toggleIsOpen]);
};
//# sourceMappingURL=StickerEmojiMenu.js.map