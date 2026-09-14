import React, { useContext, useEffect, useState } from 'react';
import { useStickersApi } from '../ui/StickersApiContext/StickersApiContext';
import { useDispatch } from '../hooks/misc';
import { noop } from '../../core/utils/misc';
export function useStickersConfig() {
    const config = useContext(StickersConfigContext);
    if (config === undefined) {
        throw new Error('StickersConfigProvider не добавлен в дерево Реакта!');
    }
    return config;
}
const StickersConfigContext = React.createContext(undefined);
export const StickersConfigProvider = ({ children, forceStickersReload, }) => {
    const dispatch = useDispatch();
    const stickersApi = useStickersApi();
    const [config, setConfig] = useState(null);
    useEffect(() => {
        let isAborted = false;
        stickersApi.cache
            .reload()
            .then(() => stickersApi.cache.imageConfigs.get())
            .then((config) => !isAborted && setConfig(config))
            .catch(noop);
        const unsub = stickersApi.cache.stickersAsync.subscribe(async (key) => {
            if (key === 'imageConfigs') {
                const config = await stickersApi.cache.imageConfigs.get();
                if (!isAborted) {
                    setConfig(config);
                }
            }
        });
        return () => {
            unsub();
            isAborted = true;
        };
    }, [stickersApi.cache]);
    useEffect(() => {
        if (!forceStickersReload) {
            return;
        }
        stickersApi.cache
            .reload(true)
            .then(() => dispatch({ type: 'StickersReloadCompleted' }));
    }, [forceStickersReload, stickersApi.cache, dispatch]);
    return (React.createElement(StickersConfigContext.Provider, { value: config }, children));
};
//# sourceMappingURL=useStickersConfig.js.map