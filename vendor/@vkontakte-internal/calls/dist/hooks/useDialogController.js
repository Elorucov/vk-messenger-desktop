import { useCallback, useState } from 'react';
export const useDialogController = (props) => {
    const [isOpened, setIsOpened] = useState(false);
    const handleCloseDialog = useCallback(() => {
        setIsOpened(false);
        props?.onAfterClose?.();
    }, []);
    const handleOpenDialog = useCallback(() => {
        setIsOpened(true);
    }, []);
    return {
        isOpened,
        handleCloseDialog,
        handleOpenDialog,
    };
};
//# sourceMappingURL=useDialogController.js.map