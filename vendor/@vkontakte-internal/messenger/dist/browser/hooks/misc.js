import React, { useContext, useEffect, useState, useRef, useLayoutEffect, createContext, useSyncExternalStore, useMemo, } from 'react';
import * as Peer from '../../core/model/Peer';
import * as Convo from '../../core/model/Convo';
import * as Channel from '../../core/model/Channel';
import { debounce, isDev, isShallowEqual } from '../../core/utils/misc';
import { TypingVariants } from '../../data/store/State';
import { getClearBaseUrl } from '../../core/model/Picture';
import { useConvoAttachesGetMissedPeers } from '../hooks/useConvoAttaches';
/**
 * Возвращает предыдущее значение.
 * Полезно для тех же случаев, для которых используется componentDidUpdate
 */
export function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}
/**
 * Дубликат componentDidUpdate
 */
export function useDidUpdate(effect, deps) {
    const mounted = useRef(false);
    useEffect(() => {
        if (!mounted.current) {
            return;
        }
        return effect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
    useEffect(() => {
        mounted.current = true;
    }, []);
}
export function useLayoutDidUpdate(effect, deps) {
    const mounted = useRef(false);
    useLayoutEffect(() => {
        if (!mounted.current) {
            return;
        }
        return effect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
    useLayoutEffect(() => {
        mounted.current = true;
    }, []);
}
/**
 * Хук для избежания stale props в cleanup функциях в эффектах, в случае если
 * не нужно вызывать cleanup фукнцию на каждое изменение какой-либо ее зависимости.
 * @param cleanup
 * @param deps массив зависимостей, при изменении которых надо вызывать cleanup.
 *
 * Этот хук не одно и то же, что замена cleanup зависимости на ее реф, так как
 * реф будет соответствовать последнему рендеру, а не тому, к которому относится cleanup.
 */
export function useActualEffectCleanup(cleanup, deps) {
    const lastDeps = useRef(deps);
    lastDeps.current = deps;
    useEffect(() => () => {
        const isDepsChanged = deps.some((dep, index) => dep !== lastDeps.current[index]);
        if (isDepsChanged) {
            cleanup();
        }
    }, 
    // Деструктурируем массив deps, чтоб не нужно было его мемоизировать.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...deps, cleanup]);
    // Реф можем использовать только на unmount.
    const cleanupRef = useRef(cleanup);
    cleanupRef.current = cleanup;
    useEffect(() => () => {
        cleanupRef.current();
    }, []);
}
/**
 * Использовать для изменения стейта при изменении пропсов или другого стейта.
 * В отличии от effect'ов react не будет вносить изменения в DOM, а сразу начнет
 * рендерить компонент с новым стейтом.
 * Если нужно обновить данные за пределами компонента, то есть если внутри коллбэка
 * надо обновить стейт родительских компонентов, то хук использовать нельзя.
 *
 * Подробнее:
 * https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
 */
export function useOnChange(callback, deps, callOnFirstRender = true) {
    const [prevDeps, setPrevDeps] = useState(callOnFirstRender ? undefined : deps);
    const isDepsChanged = prevDeps === undefined || deps.some((dep, index) => prevDeps[index] !== dep);
    if (isDepsChanged) {
        setPrevDeps(deps);
        callback();
    }
}
/**
 * Возвращает задебаунсенное значение и счетчик апдейтов debouncedUpdatesCount,
 * инкрементирующийся на каждое изменение debounced.
 * debouncedUpdatesCount нужен в случае, если value менялось, но при этом debouncedValue
 * не изменилось: например, добавили символ к строке и стерли его до истечения delay.
 */
export function useDebounced(value, delay) {
    const [result, setResult] = useState({
        debounced: value,
        debouncedUpdatesCount: 0,
    });
    useLayoutEffect(() => {
        if (delay === 0) {
            setResult((prev) => ({
                ...prev,
                debounced: value,
            }));
            return;
        }
        const timeoutId = setTimeout(() => {
            setResult(({ debouncedUpdatesCount }) => ({
                debounced: value,
                debouncedUpdatesCount: debouncedUpdatesCount + 1,
            }));
        }, delay);
        return () => {
            clearTimeout(timeoutId);
        };
    }, [value, delay]);
    return result;
}
/**
 * Выполняет установку значения не чаще чем раз в N-времени
 */
export function useThrottle(value, delay) {
    const [result, setResult] = useState(value);
    const timer = useRef(null);
    const lastSet = useRef(null);
    useEffect(() => {
        const now = Date.now();
        const clear = () => {
            const timeoutId = timer.current;
            if (timeoutId === null) {
                return;
            }
            window.clearTimeout(timeoutId);
            timer.current = null;
        };
        const set = (value) => {
            setResult(value);
            lastSet.current = now;
            clear();
        };
        const lastSetDate = lastSet.current;
        if (lastSetDate === null || now - lastSetDate > delay) {
            set(value);
            return clear;
        }
        if (timer.current) {
            return clear;
        }
        timer.current = window.setTimeout(() => {
            set(value);
            clear();
        }, delay);
        return clear();
    }, [value, timer, lastSet, delay]);
    return result;
}
export function useCallbackWithCustomCompare(callback, deps, compare) {
    const memoized = useRef(callback);
    const prevDeps = useRef(deps);
    if (!compare(prevDeps.current, deps)) {
        memoized.current = callback;
        prevDeps.current = deps;
    }
    return memoized.current;
}
export function useMemoWithCustomCompare(callback, deps, compare) {
    /**
     * Не вызываем callback, поскольку он будет дергаться на каждый ререндер.
     */
    const memoized = useRef();
    if (!memoized.current || !compare(memoized.current.deps, deps)) {
        memoized.current = { value: callback(), deps };
    }
    return memoized.current.value;
}
export function isDepsShallowEqual(prevDeps, deps) {
    return deps.every((dep, index) => isShallowEqual(dep, prevDeps[index]));
}
/**
 * Использовать контекст сторы можно только в хуках в этом модуле.
 */
const StoreContext = createContext({});
export const StoreProvider = StoreContext.Provider;
/**
 * Использовать хук useStore можно только в хуках в этом модуле.
 * ВАЖНО: передаваемый selector не должен при каждом
 * вызове возвращать новый объект, подробнее здесь:
 * https://react.dev/reference/react/useSyncExternalStore#im-getting-an-error-the-result-of-getsnapshot-should-be-cached ,
 * Для примера, как этого избежать, смотрите useTypings.
 *
 * Чтобы не уронить перфоманс, нужно понимать, насколько добавляемый
 * селектор тяжелый и сколько раз он может использоваться на странице.
 * Признаком тяжелости будет весомое увеличение времени выполнения функции
 * handleStoreChange из react-dom на каждое изменение стейта в записи
 * перфоманса в сравнении вашей ветки и мастера.
 */
export function useStore(selector) {
    const store = useContext(StoreContext);
    if (!store) {
        throw new Error('StoreProvider не добавлен в дерево Реакта!');
    }
    return useSyncExternalStore(store.subscribe, () => selector(store.getState()));
}
/**
 * Возвращает список айди пользователей, которые сейчас онлайн.
 */
export function useLastSeen(peerId) {
    return useStore((state) => {
        if (!Peer.isUserPeerId(peerId)) {
            return undefined;
        }
        return state.lastSeens.get(peerId);
    });
}
export function useCommunityTemplates() {
    return useStore((state) => state.communityTemplates);
}
export function useDispatch() {
    const store = useContext(StoreContext);
    if (!store) {
        throw new Error('StoreProvider не добавлен в дерево Реакта!');
    }
    return store.dispatch;
}
export function useHelpHints() {
    return useStore((state) => state.helpHints);
}
export function useTypings(peerId, format = 'full', visibleCount = 3) {
    const { lang } = useBrowserEnv();
    const $prevResult = useRef();
    const getTyping = (state) => {
        const peerTypings = state.typings.get(peerId);
        if (!peerTypings) {
            return;
        }
        const getUserName = (peer) => {
            return format === 'full' ? Peer.name(peer) : Peer.shortName(peer);
        };
        const types = [];
        const users = new Set();
        for (const type of TypingVariants) {
            const typing = peerTypings[type];
            if (!typing) {
                continue;
            }
            types.push(type);
            typing.peerIds.forEach((id) => users.add(id));
        }
        /**
         *  Определяем тип
         */
        const type = types.length > 1 ? 'text' : types[0] || 'text';
        /**
         * Возвращаем тип и простой текст, если не нужны имена
         */
        if (visibleCount === 0) {
            return {
                text: lang.use(`me_typing_${type}`),
                type,
            };
        }
        /**
         * Собираем информацию для отображения имен:
         * может быть недостаток данных в кеше
         */
        const namedUsers = [];
        for (const id of users) {
            const user = state.peers.get(id);
            if (!user) {
                continue;
            }
            namedUsers.push(user);
            if (namedUsers.length === visibleCount) {
                break;
            }
        }
        let names;
        const divider = ', ';
        const otherCount = users.size - namedUsers.length;
        /**
         * Генерируем список имен
         */
        switch (true) {
            // 5 безымянных богатырей
            case namedUsers.length === 0 && otherCount > 0: {
                names = lang.use('me_typing_people', {
                    num: otherCount,
                });
                break;
            }
            // Добрыня, Алёша, Илья и еще 5 человек
            case otherCount > 0: {
                names = namedUsers.map(getUserName).join(divider);
                names = lang.use('me_typing_names_lots', {
                    num: otherCount,
                    values: {
                        names,
                    },
                });
                break;
            }
            // Добрыня, Алёша и Илья
            // Добрыня и Алёша
            case namedUsers.length > 1: {
                const before = namedUsers.length > visibleCount - 1
                    ? namedUsers
                        .slice(0, visibleCount - 1)
                        .map(getUserName)
                        .join(divider)
                    : namedUsers[0]
                        ? getUserName(namedUsers[0])
                        : '';
                const lastInList = namedUsers[namedUsers.length - 1];
                const after = lastInList ? getUserName(lastInList) : '';
                names = lang.use('me_typing_names_couple', {
                    values: {
                        before,
                        after,
                    },
                });
                break;
            }
            // Добрыня
            case namedUsers.length === 1: {
                names = namedUsers[0] ? Peer.name(namedUsers[0]) : '';
                break;
            }
            // Если перевелись богатыри на Руси
            default: {
                names = '';
            }
        }
        const text = format === 'compact'
            ? names
            : lang.use(`me_typing_${type}_named`, {
                num: namedUsers.length + otherCount,
                values: {
                    names,
                },
            });
        return {
            text,
            type,
        };
    };
    return useStore((state) => {
        const prev = $prevResult.current;
        const result = getTyping(state);
        /**
         * Не возвращаем каждый раз новый объект. Подробнее:
         * https://react.dev/reference/react/useSyncExternalStore#im-getting-an-error-the-result-of-getsnapshot-should-be-cached
         */
        if (isShallowEqual(prev, result)) {
            return prev;
        }
        $prevResult.current = result;
        return result;
    });
}
/**
 * Возвращает информацию о том является ли текущий
 * дисплей дисплеем с высоким разрешением.
 */
const getIsDense = () => window.devicePixelRatio >= 1.25;
export function usePixelDensity() {
    const [isDense, setIsDense] = useState(getIsDense);
    useEffect(() => {
        const listen = () => {
            setIsDense(getIsDense);
        };
        const match = window.matchMedia(`(resolution: 1.25dppx)`);
        return matchAddEventListener(match, listen);
    }, []);
    return isDense;
}
/**
 * Изменяет настройки мессенджера при изменении
 * системной настройки уменьшения движения.
 */
export function usePreferReducedMotion() {
    const [value, setValue] = useState();
    const viewer = useViewer();
    const dispatch = useDispatch();
    const { storage } = useBrowserEnv();
    useEffect(() => {
        const match = window.matchMedia(`(prefers-reduced-motion: reduce)`);
        setValue(match.matches);
        return matchAddEventListener(match, (e) => {
            setValue(e.matches);
        });
    }, []);
    useEffect(() => {
        const prevReducedMotionSettings = storage.get('prev-reduced-motion-settings');
        const isReducedMotionNotChanged = !!prevReducedMotionSettings === value;
        if (value === undefined || isReducedMotionNotChanged) {
            return;
        }
        storage.set('prev-reduced-motion-settings', value
            ? {
                messageReactionAnimation: viewer.settings.messageReactionAnimation,
                isStickersAnimationEnabled: viewer.settings.isStickersAnimationEnabled,
                videoMessageAutoplay: viewer.settings.videoMessageAutoplay,
            }
            : null);
        let settingsToUpdate;
        if (value) {
            settingsToUpdate = {
                messageReactionAnimation: false,
                isStickersAnimationEnabled: false,
                videoMessageAutoplay: false,
            };
        }
        else {
            settingsToUpdate = prevReducedMotionSettings ?? {
                messageReactionAnimation: true,
                isStickersAnimationEnabled: true,
                videoMessageAutoplay: true,
            };
        }
        Object.entries(settingsToUpdate).forEach((entry) => {
            const [setting, value] = entry;
            if (viewer.settings[setting] === value) {
                return;
            }
            if (setting === 'isStickersAnimationEnabled') {
                dispatch({
                    type: 'ChangeStickersSettings',
                    setting: 'isStickersAnimationEnabled',
                    value,
                });
                return;
            }
            dispatch({
                type: 'UserChangedSetting',
                setting,
                value,
                entrypoint: 'reduced_motion',
            });
        });
        // Запускаем только на изменение настройки
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);
    return value;
}
/**
 *
 * @param match MediaQueryList от window.matchMedia(query)
 * @param listener Хендлера для match.addEventListener с fallback на сафари
 * @return removeEventListener Функция для удаления хендлера
 */
export function matchAddEventListener(match, listener) {
    try {
        match.addEventListener('change', listener);
        return () => {
            match.removeEventListener('change', listener);
        };
    }
    catch {
        /**
         * Fallback for safari < 14
         * https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList#browser_compatibility
         */
        match.addListener(listener);
        return () => {
            match.removeListener(listener);
        };
    }
}
/**
 * Возвращает кеш пиров
 */
export function usePeers() {
    return useStore((state) => state.peers);
}
export function usePeer(peerId, safeGet = true) {
    return useStore((state) => {
        if (peerId === undefined) {
            return;
        }
        if (safeGet) {
            return Peer.safeGet(state.peers, peerId);
        }
        return state.peers.get(peerId);
    });
}
/**
 * Возвращает кеш бесед
 */
export function useConvos() {
    return useStore((state) => state.convos);
}
export function useConvo(peerId) {
    return useStore((state) => {
        if (peerId === undefined) {
            return undefined;
        }
        return Convo.safeGet(state.convos, peerId);
    });
}
export function useSelectConvo(peerId, selector) {
    const $prevSelector = useRef();
    const $prevConvo = useRef();
    const $prevResult = useRef();
    return useStore((state) => {
        const convo = Convo.safeGet(state.convos, peerId);
        if (convo === $prevConvo.current && $prevSelector.current === selector) {
            if ($prevResult.current !== undefined) {
                return $prevResult.current;
            }
            const result = selector(convo);
            $prevResult.current = result;
            return result;
        }
        $prevSelector.current = selector;
        $prevConvo.current = convo;
        const result = selector(convo);
        if ($prevResult.current !== undefined &&
            isShallowEqual(result, $prevResult.current)) {
            return $prevResult.current;
        }
        $prevResult.current = result;
        return result;
    });
}
/**
 * Возвращает кеш бесед
 */
export function useOrganisers() {
    return useStore((state) => state.organisers);
}
const EMPTY_CHANNELS = new Map();
/**
 * Возвращает кеш каналов
 */
export function useChannels(isDisabled = false) {
    return useStore((state) => (isDisabled ? EMPTY_CHANNELS : state.channels));
}
export function useChannel(channelId, safeGet) {
    return useStore((state) => {
        if (channelId === undefined) {
            return undefined;
        }
        return safeGet
            ? Channel.safeGet(state.channels, channelId)
            : state.channels.get(channelId);
    });
}
export function useSelectChannel(channelId, selector) {
    const $prevSelector = useRef();
    const $prevChannel = useRef();
    const $prevResult = useRef();
    return useStore((state) => {
        const channel = Channel.safeGet(state.channels, channelId);
        if (channel === $prevChannel.current &&
            $prevSelector.current === selector) {
            if ($prevResult.current !== undefined) {
                return $prevResult.current;
            }
            const result = selector(channel);
            $prevResult.current = result;
            return result;
        }
        $prevSelector.current = selector;
        $prevChannel.current = channel;
        const result = selector(channel);
        if ($prevResult.current !== undefined &&
            isShallowEqual(result, $prevResult.current)) {
            return $prevResult.current;
        }
        $prevResult.current = result;
        return result;
    });
}
/**
 * Возвращает кеш трибун пространств
 */
export function useTribunes() {
    return useStore((state) => state.spacesTribunes);
}
/**
 * Возвращает кеш звонков пространств
 */
export function useSpaceCalls() {
    return useStore((state) => state.spacesCalls);
}
/**
 * Возвращает кеш бесед
 */
export function useVideoConvos() {
    return useStore((state) => state.videoConvos);
}
/**
 * Возвращает список включенных компонентов
 */
export function useFeatureFlags() {
    const store = useContext(StoreContext);
    if (!store) {
        throw new Error('StoreProvider не добавлен в дерево Реакта!');
    }
    return store.featureFlags;
}
/**
 * Возвращает текущего владельца сообщений
 */
export function useOwner() {
    const owner = useContext(OwnerContext);
    if (!owner) {
        throw new Error('OwnerProvider не добавлен в дерево Реакта!');
    }
    return owner;
}
const OwnerContext = React.createContext(null);
export const OwnerProvider = OwnerContext.Provider;
export function useCommunityMessaging() {
    return useOwner().kind === 'Group';
}
/**
 * TODO: заменить на useCommunityMessaging после удаления ручки vkm_community_messaging_ref
 * - в случае когда нужно отрендерить что-то, только для обычного аккаунта (не для сообщества)
 *   т.е. в условии применяется !isCommunityMessaging - нужно использовать useCommunityMessaging
 *   иначе в случае выключенной ручки vkm_community_messaging_ref, произойдёт рендеринг не взирая на то, что это сообщество
 *
 *   Пример: src/browser/ui/ConvoProfileSettings/ConvoProfileSettings.tsx
 *   ```
 *     {!isCommunityMessaging && (
 *       <FormItem
 *         top={lang.use('me_chat_settings_description')}
 *         htmlFor={descId}
 *       >
 *         ...
 *       </FormItem>
 *     )}
 *   ```
 */
export function useCommunityMessagingWithToggle() {
    const isCommunityMessaging = useCommunityMessaging();
    const { envFeatureFlags } = useBrowserEnv();
    return !!envFeatureFlags.isCommunityMessagingEnabled && isCommunityMessaging;
}
export function useViewer() {
    const viewer = useStoreState('viewer');
    const viewerPeer = usePeer(viewer.id);
    return useMemo(() => ({
        viewer: viewerPeer,
        ...viewer,
    }), [viewerPeer, viewer]);
}
export function useBrowserEnv() {
    const browserEnv = useContext(BrowserEnvContext);
    if (!browserEnv) {
        throw new Error('BrowserEnvProvider не добавлен в дерево Реакта!');
    }
    return browserEnv;
}
const BrowserEnvContext = React.createContext(null);
export const BrowserEnvProvider = BrowserEnvContext.Provider;
export function useViewport({ debounced = false, }) {
    const [viewportSize, setViewportSize] = useState(getViewportSize);
    const setViewportSizeDebouncedRef = useRef(debounce(setViewportSize, 300, false));
    useLayoutEffect(() => {
        const setViewportSizeDebounced = setViewportSizeDebouncedRef.current;
        const onResize = () => {
            if (debounced) {
                setViewportSizeDebounced(getViewportSize());
            }
            else {
                setViewportSize(getViewportSize());
            }
        };
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
            if (debounced) {
                setViewportSizeDebounced.cancel();
            }
        };
    }, [debounced]);
    return viewportSize;
}
function getViewportSize() {
    if (typeof window === 'undefined') {
        return [0, 0];
    }
    return [
        document.documentElement.clientWidth,
        document.documentElement.clientHeight,
    ];
}
export function useCombinedRefs(...refs) {
    return (value) => {
        refs.forEach((ref) => {
            if (!ref)
                return;
            if (typeof ref === 'function') {
                ref(value);
            }
            else {
                ;
                ref.current = value;
            }
        });
    };
}
const InsertIntoCacheContext = React.createContext(null);
export const InsertIntoCacheProvider = InsertIntoCacheContext.Provider;
/**
 * Хук для обновления кеша
 */
export function useInsertIntoCache() {
    const insertIntoCache = useContext(InsertIntoCacheContext);
    if (!insertIntoCache) {
        throw new Error('InsertIntoCacheProvider не добавлен в дерево Реакта!');
    }
    return insertIntoCache;
}
/**
 * Хук для получения текущего поискового индекса по беседам
 */
export function useConvosSearchIndex() {
    return useStore((state) => state.convosSearchIndex);
}
export function useLock(field) {
    return useStore((state) => state.locks[field]);
}
export function useStoreState(field) {
    return useStore((state) => state[field]);
}
/**
 * Хук для быстрого поиска причин перерендера компонента.
 * Использовать только в режиме разработки.
 */
export const usePerfomanceDebug = (displayName, deps) => {
    const { logger } = useBrowserEnv();
    const prevDeps = usePrevious(deps);
    useEffect(() => {
        if (!isDev) {
            logger.error('Хук usePerfomanceDebug можно использовать только в режиме разработки.');
            return;
        }
        if (prevDeps === undefined) {
            logger.info('COMPONENT NAME: ', displayName, ' FIRST RENDER');
            return;
        }
        const changedDeps = Object.entries(deps)
            .filter(([key, value]) => prevDeps[key] !== value)
            .map(([key]) => key);
        const str = changedDeps.join(', ');
        if (changedDeps.length > 0) {
            logger.info('COMPONENT NAME: ', displayName, ' DIFFERENT IN: ', str);
        }
        else {
            logger.info(`COMPONENT NAME: ${displayName} NO DIFFERENT deps included`);
        }
    });
};
/**
 * Хук для получения информации о темах оформления
 */
export function useThemeStyles() {
    const styles = useStoreState('themeStyles');
    const appearances = useStoreState('themeAppearances');
    const backgrounds = useStoreState('themeBackgrounds');
    return { styles, appearances, backgrounds };
}
/**
 * Возвращает идентификатор устройства
 */
export function useDeviceId() {
    return useStore((state) => state.deviceId);
}
export function useUrlFromBaseUrl(photo, height, width) {
    const pixelDensity = useAccuratePixelDensity();
    const oldUrl = useAppropriatePhotoSize(photo, Math.max(width, height));
    const denseWidth = Math.ceil(width * pixelDensity);
    const denseHeight = Math.ceil(height * pixelDensity);
    if (!photo) {
        return;
    }
    if (!photo.baseUrl) {
        return oldUrl;
    }
    const cleanBaseUrl = getClearBaseUrl(photo.baseUrl);
    return `${cleanBaseUrl}&cs=${denseWidth}x${denseHeight}`;
}
/**
 * Хук для получения необходимого размера изображения. Удалить после окончательного перехода на бейзурлы.
 */
export function useAppropriatePhotoSize(urls, size) {
    const isDense = usePixelDensity();
    if (!urls) {
        return undefined;
    }
    if (isDense) {
        size = size * 2;
    }
    const photos = [
        { size: 50, url: urls.photo50 },
        { size: 100, url: urls.photo100 || urls.photo50 },
        { size: 200, url: urls.photo200 || urls.photo100 || urls.photo50 },
        {
            size: 400,
            url: urls.photo400 || urls.photo200 || urls.photo100 || urls.photo50,
        },
    ];
    return photos.find((photo) => size <= photo.size && Boolean(photo.url))?.url;
}
// SPC-TODO: пока скопипастил эту функцию из общих, надо избавиться от копипасты в дальнейшем
export function useAccuratePixelDensity() {
    const [density, setDensity] = useState(() => window.devicePixelRatio);
    useEffect(() => {
        const listen = () => {
            setDensity(window.devicePixelRatio);
        };
        const match = window.matchMedia(`(resolution: 1.25dppx)`);
        return matchAddEventListener(match, listen);
    }, []);
    return density;
}
export function useChannelsContentOptions() {
    return useStore((state) => state.channelsConfig.contentOptions);
}
export function useChannelsConfig() {
    return useStore((state) => state.channelsConfig);
}
export const templateKeys = [
    '{user name}',
    '{user surname}',
    '{admin name}',
    '{admin surname}',
    '{community}',
    '{greeting}',
    '{goodbye}',
];
export const templateRegex = new RegExp(templateKeys.map((key) => key.replace(/[{}]/g, '\\$&')).join('|'), 'g');
export function useGroupBannedUser(peer) {
    return useStore((state) => peer.kind === 'User' ? state.groupBannedUsers[peer.id] : undefined);
}
export function useUserDetails(userId) {
    return useStore((state) => {
        if (!Peer.isUserPeerId(userId))
            return;
        return state.userDetails[userId];
    });
}
export function calculateAge(birthDateString) {
    if (!birthDateString) {
        return;
    }
    const [day, month, year] = birthDateString.split('.').map(Number);
    if (!year || !month) {
        return -1;
    }
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const hasHadBirthdayThisYear = today.getMonth() > birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() &&
            today.getDate() >= birthDate.getDate());
    if (!hasHadBirthdayThisYear) {
        return age - 1;
    }
    return age;
}
export function useMessageAuthor(message) {
    const isCommunityMessaging = useCommunityMessagingWithToggle();
    const adminAuthor = usePeer(message.adminAuthorId, false);
    const author = usePeer(message.authorId);
    const { fetchProfilesAndGroups: fetchAdminAuthor } = useConvoAttachesGetMissedPeers(isCommunityMessaging && message?.adminAuthorId
        ? [message.adminAuthorId]
        : []);
    const [peerCached, setPeerCached] = useState(false);
    useEffect(() => {
        if (isCommunityMessaging && !adminAuthor) {
            fetchAdminAuthor().then(() => setPeerCached(true));
        }
        else {
            setPeerCached(true);
        }
    }, [fetchAdminAuthor, setPeerCached, adminAuthor, isCommunityMessaging]);
    return {
        author,
        adminAuthor: (isCommunityMessaging &&
            peerCached &&
            message.adminAuthorId &&
            adminAuthor?.kind === 'User' &&
            adminAuthor) ||
            undefined,
    };
}
export function useMiniAppConfiguration() {
    return useStore((state) => state.miniAppConfiguration);
}
//# sourceMappingURL=misc.js.map