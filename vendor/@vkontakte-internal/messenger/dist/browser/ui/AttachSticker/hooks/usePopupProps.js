import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { usePopupAnimationTrigger, } from '@vkontakte-internal/stickers-kit';
import { PopupIcon } from '../../../ui/AttachSticker/ui/PopupIcon/PopupIcon';
import { useBrowserEnv, useDispatch, useFeatureFlags, useViewer, } from '../../../hooks/misc';
import { useStickersPopupAnimationContext } from '../../../hooks/useStickersPopupAnimation';
import { isPopupStickerServiceWorks } from '../../../utils/stickers';
import { playPopupAutoplay } from '../../../ui/StickersPopupRootContainer/stickersPopupUtils';
import { useSnackbar } from '../../../hooks/useSnackbar';
import * as Peer from '../../../../core/model/Peer';
import { useApiFetch } from '../../../hooks/useApiFetch';
export const usePopupProps = ({ sticker, message, iconPosition, popupStickerService, commentId, blockAnimation, }) => {
    // Нужно знать где находится иконка чтобы от нее найти потом контейнер для анимации
    const iconRef = useRef(null);
    const featureFlags = useFeatureFlags();
    const dispatch = useDispatch();
    const { logger } = useBrowserEnv();
    const popupLayers = useMemo(() => {
        return sticker.item?.popup?.layers ?? [];
    }, [sticker]);
    const { currentAnimatedMessage, resetPopupAnimation, hasPopupAnimationPlaying, playPopupAnimation, animationShouldBeStopped, setAnimationShouldBeStopped, } = useStickersPopupAnimationContext();
    const markPlayingPopupAnimation = useCallback(() => {
        if (!message) {
            return;
        }
        dispatch({
            type: 'UserHaveSeenPopupAnimation',
            message,
        });
        playPopupAnimation(message);
    }, [message, dispatch, playPopupAnimation]);
    const isPopupSticker = Boolean(popupLayers.length);
    const isAnimationEnabledGlobally = featureFlags.vkm_stickers_popup;
    const isAnimationEnabledForSticker = isPopupSticker &&
        popupStickerService &&
        (Boolean(message) || Boolean(commentId));
    const isAnimationEnabled = isAnimationEnabledGlobally && isAnimationEnabledForSticker;
    const viewer = useViewer();
    const { lang } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const snackbar = useSnackbar();
    const hasGradientFix = featureFlags.vas_popup_sticker_gradient_fix;
    // отслеживаем во вьюпорте только пришедшие в диалоге попап-стикеры
    const isPopupStickerReceivedWithAnimationAutoplay = Boolean(isAnimationEnabled &&
        !sticker.isPopupAutoplayed &&
        sticker.popupStickerAutoplayTrigger === 'receive');
    // триггер, проверяющий скролл и нахождение во вьюпорте
    const { isReady, disconnected } = usePopupAnimationTrigger({
        isAnimationEnabled: isPopupStickerReceivedWithAnimationAutoplay,
        targetRef: iconRef,
        targetId: message?.kind === 'Queued' ? message?.randomId : message?.cmid,
    });
    // помечаем попап-стикеры, за которыми уже не следим,
    // хотя они еще не во вьюпорте
    useEffect(() => {
        if (disconnected) {
            if (!message) {
                return;
            }
            dispatch({
                type: 'UserHaveSeenPopupAnimation',
                message,
            });
        }
    }, [disconnected, message, dispatch]);
    useEffect(() => {
        if (!iconRef.current ||
            !isAnimationEnabled ||
            sticker.isPopupAutoplayed ||
            (!isReady && sticker.popupStickerAutoplayTrigger === 'receive') ||
            blockAnimation) {
            return;
        }
        if (currentAnimatedMessage) {
            if (!message) {
                return;
            }
            dispatch({
                type: 'UserHaveSeenPopupAnimation',
                message,
            });
            return;
        }
        if (isPopupStickerServiceWorks(popupStickerService)) {
            return;
        }
        const peerId = message?.peerId;
        try {
            markPlayingPopupAnimation();
            // Прерывание автоплея при получении НЕ в личном диалоге обрабатываем отдельно
            if (peerId &&
                !Peer.isUserPeerId(peerId) &&
                sticker.popupStickerAutoplayTrigger === 'receive' &&
                viewer.settings.isPopupStickersInterruptCounterEnabled) {
                // Считаем количество прерываний (с троттлом) и показываем тост, если пришел флаг с бэка
                playPopupAutoplay({
                    stickerElement: iconRef.current,
                    layers: popupLayers,
                    onEndPlay: () => {
                        resetPopupAnimation();
                    },
                    disableHardcodedZIndex: hasGradientFix && true,
                }, peerId, viewer.id, apiFetch, (data) => {
                    if (!data) {
                        return;
                    }
                    let actionWasClicked = false;
                    snackbar({
                        message: lang.use('me_stickers_popup_blocker_snackbar_title'),
                        duration: 5000,
                        autoClose: true,
                        onClose: () => {
                            if (actionWasClicked) {
                                return;
                            }
                            data.onClose();
                        },
                        action: lang.use('me_stickers_popup_blocker_snackbar_action_label'),
                        onActionClick: () => {
                            /**
                             * Не используем data.onActionClick() из пакета, потому что будем менять настройку локальным экшеном в reforged реактивно
                             */
                            actionWasClicked = true;
                            dispatch({
                                type: 'UserChangedStickersPopupAutoplay',
                                userAction: 'off_stickers_popup_animation',
                                peerId,
                            });
                        },
                    });
                }, popupStickerService);
            }
            else {
                popupStickerService.prepareWithDestroyEvent({
                    stickerElement: iconRef.current,
                    layers: popupLayers,
                    onEndPlay: () => {
                        resetPopupAnimation();
                    },
                    disableHardcodedZIndex: hasGradientFix && true,
                });
            }
        }
        catch (err) {
            logger.error('usePopupProps play animation', err);
        }
    }, [
        dispatch,
        message,
        currentAnimatedMessage,
        isReady,
        markPlayingPopupAnimation,
        resetPopupAnimation,
        popupLayers,
        popupStickerService,
        sticker.isPopupAutoplayed,
        isAnimationEnabled,
        logger,
        viewer.id,
        snackbar,
        apiFetch,
        lang,
        sticker.popupStickerAutoplayTrigger,
        viewer.settings.isPopupStickersInterruptCounterEnabled,
        hasGradientFix,
        blockAnimation,
    ]);
    useEffect(() => {
        if (animationShouldBeStopped && popupStickerService) {
            popupStickerService.destroyWithFadeOut();
            setAnimationShouldBeStopped(false);
        }
    }, [
        animationShouldBeStopped,
        popupStickerService,
        setAnimationShouldBeStopped,
    ]);
    return useMemo(() => {
        if (!isAnimationEnabledGlobally || !isPopupSticker) {
            return {
                wrapperProps: {},
            };
        }
        const insetIcon = ['rightInset', 'leftInset'].includes(iconPosition);
        if (!isAnimationEnabledForSticker) {
            return {
                wrapperProps: {
                    icon: React.createElement(PopupIcon, { isLoading: false, inset: insetIcon }),
                    iconPosition,
                },
            };
        }
        const isAnimationPlaying = Boolean(message && hasPopupAnimationPlaying(message));
        const props = {
            popupProps: { isAnimationPlaying: isAnimationPlaying },
            wrapperProps: {
                icon: React.createElement(PopupIcon, { isLoading: isAnimationPlaying, inset: insetIcon }),
                iconWrapperRef: iconRef,
                iconPosition,
                buttonAriaLabel: lang.use('me_play_popup_sticker_aria_label'),
            },
        };
        if (!isAnimationPlaying &&
            !isPopupStickerServiceWorks(popupStickerService)) {
            props.wrapperProps.onContentClick = (event) => {
                // Не хотим чтобы выделялось сообщение
                event.stopPropagation();
                if (popupLayers.length) {
                    markPlayingPopupAnimation();
                    popupStickerService.prepareWithDestroyEvent({
                        stickerElement: event.target,
                        layers: popupLayers,
                        onEndPlay: () => {
                            resetPopupAnimation();
                        },
                        disableHardcodedZIndex: hasGradientFix && true,
                    });
                }
            };
        }
        return props;
    }, [
        message,
        iconRef,
        hasPopupAnimationPlaying,
        resetPopupAnimation,
        popupLayers,
        iconPosition,
        popupStickerService,
        markPlayingPopupAnimation,
        isAnimationEnabledGlobally,
        isAnimationEnabledForSticker,
        isPopupSticker,
        lang,
        hasGradientFix,
    ]);
};
//# sourceMappingURL=usePopupProps.js.map