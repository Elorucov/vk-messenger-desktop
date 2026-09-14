import { destroy, init, update } from '../symbols';
export const isDestroyable = (instance) => {
    return instance && typeof instance[destroy] === 'function';
};
export const isUpdatable = (instance) => {
    return instance && typeof instance[update] === 'function';
};
export const isInitable = (instance) => {
    return instance && typeof instance[init] === 'function';
};
export const isModel = (instance) => {
    return isInitable(instance) && isUpdatable(instance);
};
//# sourceMappingURL=guards.js.map