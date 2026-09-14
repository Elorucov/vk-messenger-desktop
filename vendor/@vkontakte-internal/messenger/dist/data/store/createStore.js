import { devTools } from '../store/devtools';
import { isDev } from '../../core/utils/misc';
import { initial, reducer } from '../store/reducer';
import { setAutoFreeze } from 'immer';
export function createStore(env, featureFlags, initialState = initial, initialParams, viewerId, ownerId, profileType, cachedState) {
    let isStarted = false;
    let isDisposed = false;
    const tools = isDev && devTools();
    const listeners = new Set();
    let [state, effects] = initialState(featureFlags, viewerId, ownerId, profileType, initialParams, cachedState);
    if (tools) {
        tools.init(state);
    }
    const subscribe = (cb) => {
        listeners.add(cb);
        return () => {
            listeners.delete(cb);
        };
    };
    const dispatch = (action) => {
        if (isDisposed) {
            return;
        }
        if (!isStarted) {
            throw new Error('Стор еще не был активирован. Нужно вызвать store.start().');
        }
        // ATTENTION: Флаг сторого только для МВК!!!
        if (env.envFeatureFlags.ensureImmerAutofreezeDangerouseFlagOnlyForMVK) {
            setAutoFreeze(true);
        }
        const [nextState, nextEffects] = reducer(state, action, featureFlags, env.envFeatureFlags);
        // ATTENTION: Флаг сторого только для МВК!!!
        if (env.envFeatureFlags.ensureImmerAutofreezeDangerouseFlagOnlyForMVK) {
            setAutoFreeze(false);
        }
        if (tools) {
            tools.send(action, nextState);
        }
        const hasStateChanged = state !== nextState;
        state = nextState;
        execute(dispatch, nextEffects, env, action.type);
        if (hasStateChanged) {
            for (const listener of listeners) {
                listener(nextState);
            }
        }
    };
    return {
        start: () => {
            if (isStarted) {
                return;
            }
            isStarted = true;
            execute(dispatch, effects, env, 'Init');
        },
        dispatch,
        subscribe,
        featureFlags,
        getState: () => state,
        getListeners: () => listeners,
        /**
         * Освободить ресурсы
         */
        dispose() {
            dispatch({
                type: 'DisposePollFallenConvos',
            });
            isDisposed = true;
        },
    };
}
function execute(dispatch, effects, env, actionName) {
    if (effects.length === 0) {
        return;
    }
    /**
     * Запустим калькуляцию асинхронно эффектов,
     * чтобы они не замедляли исполнение текущего кода.
     */
    setTimeout(() => {
        for (const effect of effects) {
            if (typeof effect === 'function') {
                effect(env)
                    .then(dispatch)
                    .catch((err) => {
                    env.logger.error(`[${actionName}] Необработанная ошибка редьюсера`, err);
                });
            }
        }
    });
}
//# sourceMappingURL=createStore.js.map