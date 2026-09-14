import { MAX_MESSAGE_ATTACHES } from '../../core/config/config';
/**
 * Разбиение большого количества аттачей на несколько сообщений
 */
export function splitMessageAttaches(attaches) {
    const flatAttaches = Object.values(attaches).flat();
    const keysMap = Object.fromEntries(Object.entries(attaches).map(([key, value]) => {
        if (Array.isArray(value)) {
            return [value[0].kind, { key, isArray: true }];
        }
        return [value.kind, { key, isArray: false }];
    }));
    if (flatAttaches.length <= MAX_MESSAGE_ATTACHES) {
        return [attaches];
    }
    return flatAttaches.reduce((acc, attach, index) => {
        const partIndex = Math.floor(index / MAX_MESSAGE_ATTACHES);
        const keyMap = keysMap[attach.kind];
        if (!keyMap) {
            return acc;
        }
        acc[partIndex][keyMap.key] = keyMap.isArray
            ? acc[partIndex][keyMap.key]?.concat(attach) || [attach]
            : attach;
        return acc;
    }, Array.from({ length: Math.ceil(flatAttaches.length / MAX_MESSAGE_ATTACHES) }, () => Object()));
}
//# sourceMappingURL=splitMessageAttaches.js.map