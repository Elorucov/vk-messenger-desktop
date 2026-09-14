import { useState } from 'react';
export const useLoadingStage = () => {
    const [stage, setStage] = useState('initializing');
    const setInitial = () => {
        setStage('initializing');
    };
    const setReady = () => {
        setStage('ready');
    };
    const setFailed = () => {
        setStage('failed');
    };
    return {
        stage,
        setInitial,
        setReady,
        setFailed,
    };
};
//# sourceMappingURL=useLoadingStage.js.map