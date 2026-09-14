import { useCallback, useState } from 'react';
export const useDownloadModal = () => {
    const [openedModal, setOpenedModal] = useState(false);
    const closeModal = useCallback(() => {
        setOpenedModal(false);
    }, []);
    const openModal = useCallback((market) => {
        setOpenedModal(market);
    }, []);
    return {
        openedModal,
        openModal,
        closeModal,
    };
};
//# sourceMappingURL=useDownloadModal.js.map