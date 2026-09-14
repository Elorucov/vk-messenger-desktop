import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback } from 'react';
import { useTypedDispatch } from '../hooks/useTypedDispatch';
import { UploadBackgroundPhotoModal } from '../components/UploadBackgroundPhotoModal/UploadBackgroundPhotoModal';
import { UploadBackgroundPhoto as UploadBackgroundPhotoComponent } from '../components/UploadBackgroundPhoto/UploadBackgroundPhoto';
import { ModalType } from '@vkontakte-internal/calls-core';
import { toggleModal } from '../actions';
export const UploadBackgroundPhotoContainer = ({ onAddBackground, loading }) => {
    const dispatch = useTypedDispatch();
    const onClose = useCallback(() => {
        dispatch(toggleModal(ModalType.VIRUTAL_BACKGROUND));
    }, []);
    const onSubmit = useCallback((file) => {
        onAddBackground(file)
            .then(onClose)
            .catch(() => {
            dispatch(toggleModal(ModalType.UPLOAD_BACKGROUND_ERROR));
        });
    }, [onClose]);
    return (_jsx(UploadBackgroundPhotoModal, { onClose: onClose, children: _jsx(UploadBackgroundPhotoComponent, { loading: loading, onSubmit: onSubmit }) }));
};
//# sourceMappingURL=UploadBackgroundPhotoContainer.js.map