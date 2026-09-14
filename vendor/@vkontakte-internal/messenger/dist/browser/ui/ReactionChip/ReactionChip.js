import React, { useCallback, useMemo } from 'react';
import { useBrowserEnv, usePeers } from '../../hooks/misc';
import cx from 'classnames';
import './ReactionChip.css';
import { AnimatedCounter } from '../../ui/AnimatedCounter/AnimatedCounter';
import { UsersStack } from '../../ui/UsersStack/UsersStack';
import { MessageReactionImage } from '../../ui/MessageReactionImage/MessageReactionImage';
import { UnknownMessageReaction } from '../../ui/UnknownMessageReaction/UnknownMessageReaction';
import { getReactionLangById } from '../../utils/reactions';
import { onElementKeyDownFactory, } from '../../utils/elementKeyDown';
export const REACTION_CHIP_MAX_AVATARS = 3;
export const ReactionChip = ({ reaction, count, peerIds, theme, active = false, forceNumber = false, disableAnimations = false, playAnimation = false, onClick, onAnimationEnd, }) => {
    const peers = usePeers();
    const { lang } = useBrowserEnv();
    const userPhotos = useMemo(() => {
        if (!peerIds) {
            return [];
        }
        return Array.from(peerIds)
            .map((id) => peers.get(id)?.photo)
            .filter((photo) => photo !== undefined);
    }, [peers, peerIds]);
    const handleClick = useCallback((e) => {
        if (onClick) {
            e.preventDefault();
            e.stopPropagation();
            onClick(reaction?.id ?? null);
        }
    }, [onClick, reaction]);
    const showNumbers = count > REACTION_CHIP_MAX_AVATARS ||
        userPhotos.length !== peerIds?.size ||
        forceNumber;
    const handleEnter = useCallback((keyCombo, event) => {
        if (keyCombo === 'Enter') {
            event.stopPropagation();
            event.preventDefault();
            onClick?.(reaction?.id ?? null);
        }
    }, [onClick, reaction?.id]);
    const handleAnimationEnd = useCallback(() => {
        if (reaction?.id !== undefined) {
            onAnimationEnd?.(reaction.id);
        }
    }, [onAnimationEnd, reaction?.id]);
    const langKey = reaction?.id ? getReactionLangById(reaction.id) : undefined;
    return (React.createElement("div", { className: cx('ReactionChip', `ReactionChip--${theme}`, {
            'ReactionChip--active': active,
            'ReactionChip--clickable': onClick,
        }), onClick: handleClick, 
        // Не вызываем контекстное меню по клику на реакцию
        onContextMenu: (e) => e.stopPropagation(), onKeyDown: onElementKeyDownFactory(handleEnter), tabIndex: 0, role: "button", "aria-pressed": active, "aria-label": langKey ? lang.use(langKey) : undefined },
        onClick && React.createElement("div", { className: "ReactionChip__overlay" }),
        React.createElement("div", { className: "ReactionChip__content" },
            React.createElement("div", { className: "ReactionChip__reaction" }, reaction ? (React.createElement(MessageReactionImage, { id: reaction.id, image: reaction.image, animationSmall: disableAnimations ? undefined : reaction.animationSmall, animationBig: disableAnimations ? undefined : reaction.animationBig, play: playAnimation, onAnimationEnd: handleAnimationEnd, size: 26 })) : (React.createElement(UnknownMessageReaction, { className: "ReactionChip__reactionUnknown", color: active
                    ? 'var(--vkui--color_icon_contrast)'
                    : theme === 'outgoing'
                        ? 'var(--vkui--color_text_accent)'
                        : 'var(--vkui--color_icon_medium_alpha)' }))),
            React.createElement("div", { className: cx('ReactionChip__counter', {
                    'ReactionChip__counter--numbers': showNumbers,
                }) }, showNumbers ? (React.createElement(AnimatedCounter, { count: count, className: "ReactionChip__counter-text", format: "regular" })) : (React.createElement(UsersStack, { count: count, photos: userPhotos, visibleCount: REACTION_CHIP_MAX_AVATARS, size: 18 }))))));
};
//# sourceMappingURL=ReactionChip.js.map