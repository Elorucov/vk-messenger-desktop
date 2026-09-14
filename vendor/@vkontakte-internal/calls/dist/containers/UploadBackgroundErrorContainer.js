import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback } from 'react';
import { useTypedDispatch } from '../hooks/useTypedDispatch';
import { UploadBackgroundErrorModal } from '../components/UploadBackgroundErrorModal/UploadBackgroundErrorModal';
import { ModalType } from '@vkontakte-internal/calls-core';
import { useLang } from '../hooks/useLang';
import { toggleModal } from '../actions';
export const UploadBackgroundErrorContainer = () => {
    const dispatch = useTypedDispatch();
    const { getLang } = useLang();
    const onClose = useCallback(() => {
        dispatch(toggleModal(ModalType.VIRUTAL_BACKGROUND));
    }, []);
    const onSubmit = useCallback(() => {
        dispatch(toggleModal(ModalType.UPLOAD_BACKGROUND_PHOTO));
    }, []);
    return (_jsx(UploadBackgroundErrorModal, { onClose: onClose, onSubmit: onSubmit, children: getLang('calls_error_upload_background_image') }));
};
//# sourceMappingURL=UploadBackgroundErrorContainer.js.map