import { useMemo } from 'react';
import { HelpHints } from '../';
import { useHelpHints } from './helpHints';
export function useHelpHintResource(id, resourceKey) {
    const { isHelpHintsReloading } = useHelpHints();
    return useMemo(() => {
        if (!id || !resourceKey) {
            return;
        }
        return HelpHints.getSync(id)
            ?.getResource(resourceKey);
    }, [id, resourceKey, isHelpHintsReloading]);
}
//# sourceMappingURL=helpHintResource.js.map