import { useMemo } from 'react';
import { HelpHints } from '../';
import { useHelpHints } from './helpHints';
export function useHelpHint(id) {
    const { isHelpHintsReloading } = useHelpHints();
    return useMemo(() => {
        if (!id) {
            return;
        }
        return HelpHints.getSync(id);
    }, [isHelpHintsReloading]);
}
//# sourceMappingURL=helpHint.js.map