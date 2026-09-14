import { useBrowserEnv } from '../../hooks/misc';
import React, { createContext, useContext, useLayoutEffect, useMemo, useState, } from 'react';
const RouterContext = createContext({});
export const RouterProvider = ({ children, }) => {
    const { router } = useBrowserEnv();
    const [screenRoute, setScreenRoute] = useState(router.screenRoute);
    useLayoutEffect(() => {
        const unsub = router.subscribe((route) => setScreenRoute(route));
        return () => unsub();
    }, [router]);
    const value = useMemo(() => ({
        router,
        screenRoute,
        runtimeRoute: router.runtimeRoute,
    }), [router, screenRoute]);
    return (React.createElement(RouterContext.Provider, { value: value }, children));
};
export const useRouter = () => {
    const { router, screenRoute, runtimeRoute } = useContext(RouterContext);
    return {
        router,
        screenRoute,
        runtimeRoute,
        modal: screenRoute.modal?.slice(-1).pop() || null,
        rightPanel: screenRoute.rp?.slice(-1).pop() || null,
        navigate: router.push,
        replace: router.replace,
        pop: router.pop,
    };
};
/**
 * @deprecated НЕ ИСПОЛЬЗУЙТЕ!
 *
 * Не стоит использовать этот хук, потому что гвоздями прибивает компоненты к окнретному роуту.
 * Это будет проблемой для пространств. Ищите другие пути реализации фич без привязки к роутам.
 */
export const useConvoRoute = () => {
    const { screenRoute } = useRouter();
    if (screenRoute.kind !== 'ConvoRoute') {
        throw Error('Используйте хук только внутри роута Convo');
    }
    return screenRoute;
};
//# sourceMappingURL=Router.js.map