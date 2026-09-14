import * as Reaction from '../../core/model/Reaction';
import * as Peer from '../../core/model/Peer';
export function fromApiMessageReactions(apiReactions) {
    return apiReactions
        .sort((a, b) => b.count - a.count)
        .reduce((acc, cur) => {
        acc.set(Reaction.resolveId(cur.reaction_id), {
            reactionId: Reaction.resolveId(cur.reaction_id),
            count: cur.count,
            peerIds: new Set(cur.user_ids.map(Peer.resolveId).sort((a, b) => a - b)),
        });
        return acc;
    }, new Map());
}
export function fromApiReactionAsset(apiReactionAssets) {
    return {
        id: Reaction.resolveId(apiReactionAssets.reaction_id),
        image: apiReactionAssets.links.static,
        animationSmall: apiReactionAssets.links.small_animation,
        animationBig: apiReactionAssets.links.big_animation,
        name: '',
    };
}
//# sourceMappingURL=MessageReactionConverter.js.map