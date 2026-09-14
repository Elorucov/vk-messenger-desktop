import React, { useCallback, useEffect } from 'react';
import { REACTION_CHIP_MAX_AVATARS, ReactionChip, } from '../../ui/ReactionChip/ReactionChip';
import { ReactedPeersDropdown } from '../../ui/ReactedPeersDropdown/ReactedPeersDropdown';
import { useMessageReactionAnimation } from '../../hooks/useMessageReactionAnimation';
export const ConvoMessageReactions = React.memo(({ message, messageReactions, onReactionClick, unreadReactionId, canOpenReactedPeers, disableAnimations, reactionChipTheme, }) => {
    const reactionsArray = [...message.reactions.values()];
    /**
     * Принудительно показываем числа вместо аватарок в чипсах реакций в двух случаях:
     * - число реакций больше 3
     * - любую из реакций поставило больше 3 человек
     */
    const isForcedNumberReaction = message.reactions.size > 3 ||
        reactionsArray.some((reaction) => reaction.count > REACTION_CHIP_MAX_AVATARS);
    const { animate, hasAnimation, onAnimationEnd } = useMessageReactionAnimation();
    const handleAnimationEnd = useCallback((reactionId) => {
        onAnimationEnd(message.cmid, reactionId);
    }, [message.cmid, onAnimationEnd]);
    useEffect(() => {
        if (unreadReactionId !== undefined) {
            animate(message.cmid, unreadReactionId);
        }
    }, [unreadReactionId, message.cmid, animate]);
    return reactionsArray.map((reaction) => {
        const react = messageReactions.get(reaction.reactionId) || null;
        const chip = (React.createElement(ReactionChip, { key: reaction.reactionId, reaction: react, count: reaction.count, peerIds: reaction.peerIds, theme: reactionChipTheme, active: reaction.reactionId === message.reactionId, forceNumber: isForcedNumberReaction, disableAnimations: disableAnimations, playAnimation: hasAnimation(message.cmid, reaction.reactionId), onClick: onReactionClick, onAnimationEnd: handleAnimationEnd }));
        return canOpenReactedPeers ? (React.createElement(ReactedPeersDropdown, { key: reaction.reactionId, peerId: message.peerId, cmid: message.cmid, reactionId: reaction.reactionId, messageReactions: messageReactions, count: reaction.count, canOpen: canOpenReactedPeers }, chip)) : (chip);
    });
});
//# sourceMappingURL=ConvoMessageReactions.js.map