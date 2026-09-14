import { jsx as _jsx } from "react/jsx-runtime";
import { useUnit } from 'effector-react';
import { useMemo } from 'react';
import { LangPackIdProvider } from './context';
import { loadPackFx } from './model/packs';
import { wrapSuspense } from '../../utils/wrapSuspense';
const wrappers = new Map();
export function LangPackProvider({ children, suspense, ...options }) {
    const id = useMemo(() => JSON.stringify(options), [options]);
    const loadPack = useUnit(loadPackFx);
    const loadPackSuspense = useMemo(() => {
        let wrapper = wrappers.get(id);
        if (!wrapper) {
            wrapper = wrapSuspense(loadPack({
                id,
                ...options,
            }));
            wrappers.set(id, wrapper);
        }
        return wrapper;
    }, [id, options]);
    if (suspense) {
        loadPackSuspense.read();
    }
    return _jsx(LangPackIdProvider, { value: id, children: children });
}
//# sourceMappingURL=LangPackProvider.js.map