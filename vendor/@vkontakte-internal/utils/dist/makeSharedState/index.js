/* eslint-disable no-restricted-globals */
/**
 * Utility for storing internal module state as a session-persistent (i.e. until reload) singleton in global scope.
 *
 * This solves the following issues:
 * 1. Shares internal module state even if the module chunk is bundled into multiple bundles.
 * 2. Preserves internal module state when the module is replaced by the new version
 *
 * In general shared state should be avoided. It certainly SHOULD NOT be used across different modules.
 */
// State is stored on window (not in module scope), because this module itself can be reloaded.
const GLOBAL_SHARED_STATE_KEY = '__SHARED_STATE_KEY';
const init = () => {
    const GLOBAL_SHARED_STATE = self.hasOwnProperty(GLOBAL_SHARED_STATE_KEY)
        ? self[GLOBAL_SHARED_STATE_KEY]
        : Object.create(null);
    Object.defineProperty(self, GLOBAL_SHARED_STATE_KEY, {
        configurable: true,
        value: GLOBAL_SHARED_STATE,
    });
};
if (typeof self !== 'undefined') {
    init();
}
const getState = () => self[GLOBAL_SHARED_STATE_KEY];
const getStateForKey = (stateKey) => getState()[stateKey];
const replaceStateForKey = (stateKey, newState) => {
    getState()[stateKey] = newState;
};
/**
 * Initialize shared singleton state getter
 * WARNING: If you change the interface of the shared state (T), you MUST change the version.
 * Why is that important? Chunks are loaded by an user action.
 * The new version of static can be deployed between chunk loading.
 * First chunk created the shared state with 'old interface'.
 * Second chunk requests the shared state and expects a 'new interface', but gets 'old one'.
 * It can be a reason of runtime errors.
 * Don't make version an optional parameter. It's a good practice to force you to think about the version.
 *
 * @example
 * const moduleSharedState = makeSharedState('some-key', () => ({ someState: 42 }), {version: 0}));
 * console.log(moduleSharedState().someState);
 * or
 * const moduleSharedState = makeSharedState(__filename, () => ({ someState: 42 }), {version: 1});
 */
export function makeSharedState(stateKey, getInitialState, options) {
    if (typeof self === 'undefined') {
        const state = getInitialState();
        return () => state;
    }
    const normalizedKey = normalizeKey(stateKey, options.version);
    const isSharedStateInitialized = normalizedKey in getState();
    if (!isSharedStateInitialized) {
        replaceStateForKey(normalizedKey, getInitialState());
    }
    return () => getStateForKey(normalizedKey);
}
function normalizeKey(key, version) {
    let result = key.replace(/[^a-zA-Z0-9-]/gi, '_').toLowerCase();
    if (version !== 0) {
        result += `__${version}`;
    }
    return result;
}
//# sourceMappingURL=index.js.map