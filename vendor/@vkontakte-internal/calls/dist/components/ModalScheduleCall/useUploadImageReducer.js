import { useReducer, useCallback } from 'react';
export var ACTIONS;
(function (ACTIONS) {
    ACTIONS["SET_IMG_SRC"] = "SET_IMG_SRC";
    ACTIONS["SET_ERROR"] = "SET_ERROR";
    ACTIONS["SET_PROGRESS"] = "SET_PROGRESS";
    ACTIONS["CLEAR"] = "CLEAR";
})(ACTIONS || (ACTIONS = {}));
const initialState = {
    error: '',
    imgSrc: '',
    progress: 0,
};
const useActionCreator = (type, dispatch) => {
    return useCallback((data) => {
        dispatch({
            type,
            data,
        });
    }, []);
};
const reducer = (state = initialState, action) => {
    switch (action.type) {
        case ACTIONS.SET_IMG_SRC: {
            return {
                ...state,
                imgSrc: action.data,
            };
        }
        case ACTIONS.SET_ERROR: {
            return {
                ...state,
                error: action.data,
            };
        }
        case ACTIONS.SET_PROGRESS: {
            return {
                ...state,
                progress: action.data,
            };
        }
        case ACTIONS.CLEAR: {
            return initialState;
        }
        default: {
            return { ...state };
        }
    }
};
export const useUploadImageReducer = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const clear = useActionCreator(ACTIONS.CLEAR, dispatch);
    const clearState = useCallback(() => clear(undefined), []);
    const setImgSrc = useActionCreator(ACTIONS.SET_IMG_SRC, dispatch);
    const setError = useActionCreator(ACTIONS.SET_ERROR, dispatch);
    const setProgress = useActionCreator(ACTIONS.SET_PROGRESS, dispatch);
    return {
        state,
        setImgSrc,
        setError,
        setProgress,
        clearState,
    };
};
//# sourceMappingURL=useUploadImageReducer.js.map