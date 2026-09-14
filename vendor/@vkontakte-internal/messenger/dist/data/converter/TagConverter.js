import * as Tag from '../../core/model/Tag';
export function fromApiTag(tag, peerIds) {
    return {
        ...getDefaults(peerIds),
        ...tag,
        /**
         * Бэк присылает цвета с #, что не соответствует типу в api-schema-typescript
         * TODO: убрать, когда бэк поправит отправку
         */
        color: tag.color.replace(/^#?/, ''),
        id: Tag.resolveId(tag.id),
        uses: tag.uses || 0,
    };
}
function getDefaults(peerIds) {
    return {
        peerIds: new Set(peerIds),
    };
}
//# sourceMappingURL=TagConverter.js.map