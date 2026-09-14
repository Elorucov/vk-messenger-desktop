import { nanoid } from 'nanoid';
import { produce } from 'immer';
/**
 * Так как есть необходимость во внешнем (от реакта) контексте, где
 * хочется использовать снэкбары, создаем стор, который будет
 * хранить в себе все снэкбары
 */
export const snackbarStore = createStore();
function createStore(initialState = []) {
    let state = initialState;
    const listeners = new Set();
    const setState = (setStateFn) => {
        state = setStateFn(state);
        listeners.forEach((listener) => listener(state));
    };
    return {
        getState: () => state,
        subscribe: (listener) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        reset: () => setState(() => initialState),
        create: (snackbar) => {
            const id = resolveSnackbarId(snackbar.id || nanoid());
            const createdSnackbar = {
                ...snackbar,
                id,
                onRequestRemove: () => snackbarStore.remove(id),
                requestClose: false,
            };
            setState(produce((draft) => {
                draft.push(createdSnackbar);
                draft.sort((a, b) => (a.priority || 0) - (b.priority || 0));
            }));
            return id;
        },
        remove: (id) => {
            setState((prevState) => prevState.filter((snackbar) => snackbar.id !== id));
        },
        update: (id, snackbar) => {
            setState(produce((draft) => {
                const snackbarIndex = draft.findIndex((snackbar) => snackbar.id === id);
                const prevSnackbar = draft[snackbarIndex];
                if (!prevSnackbar) {
                    return;
                }
                draft[snackbarIndex] = {
                    ...prevSnackbar,
                    ...snackbar,
                };
                draft.sort((a, b) => (a.priority || 0) - (b.priority || 0));
            }));
        },
        closeAll: (ids) => {
            setState((prev) => {
                if (ids?.length) {
                    return prev.map((snackbar) => ({
                        ...snackbar,
                        requestClose: ids.includes(snackbar.id) ?? snackbar.requestClose,
                    }));
                }
                return prev.map((snackbar) => ({
                    ...snackbar,
                    requestClose: true,
                }));
            });
        },
        close: (id) => {
            setState((prevState) => prevState.map((snackbar) => ({
                ...snackbar,
                requestClose: snackbar.id === id,
            })));
        },
    };
}
/**
 * Создать снэкбар внутри MEApp, но не из компонентов реакта
 * (например из стора)
 */
export function createSnackbar() {
    const snackbar = (snackbar) => {
        return snackbarStore.create(snackbar);
    };
    snackbar.update = (id, snackbar) => {
        snackbarStore.update(id, snackbar);
    };
    snackbar.closeAll = snackbarStore.closeAll;
    snackbar.close = snackbarStore.close;
    return snackbar;
}
function resolveSnackbarId(id) {
    return id;
}
//# sourceMappingURL=snackbarStore.js.map