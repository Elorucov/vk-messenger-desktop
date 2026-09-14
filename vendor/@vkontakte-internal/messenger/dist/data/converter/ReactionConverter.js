import * as ReactionOld from '../../core/model/ReactionOld';
import * as Reaction from '../../core/model/Reaction';
export function fromApiPostReaction(apiReaction) {
    if (!apiReaction.asset.animation_url ||
        !apiReaction.asset.title_color?.dark ||
        !apiReaction.asset.title_color?.light) {
        return;
    }
    const image48 = apiReaction.asset.images.find((image) => image.height === 48)?.url;
    const image72 = apiReaction.asset.images.find((image) => image.height === 72)?.url;
    if (!image48 || !image72) {
        return;
    }
    return {
        id: ReactionOld.resolveId(apiReaction.id),
        animation: apiReaction.asset.animation_url,
        title: apiReaction.title,
        image48,
        image72,
        color: {
            light: apiReaction.asset.title_color?.light,
            dark: apiReaction.asset.title_color?.dark,
        },
    };
}
export function fromApiReaction(apiReaction) {
    return {
        id: Reaction.resolveId(apiReaction.reaction_id),
        image: apiReaction.links.static,
        animationSmall: apiReaction.links.small_animation,
        animationBig: apiReaction.links.big_animation,
        name: '',
    };
}
//# sourceMappingURL=ReactionConverter.js.map