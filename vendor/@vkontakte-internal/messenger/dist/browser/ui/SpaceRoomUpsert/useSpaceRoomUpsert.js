import { useCallback, useRef, useState } from 'react';
import { useRouter } from '../../ui/Router/Router';
import { getLengthWithEmoji } from '../../../core/utils/emoji';
import { useModal } from '../../hooks/useModal';
export function useSpaceRoomUpsert({ modalGroupId, initialSectionId, getShouldShowConfirm, }) {
    const { navigate, screenRoute } = useRouter();
    const exitConfirmationModal = useModal(modalGroupId);
    const [formData, setFormData] = useState({
        name: '',
        type: 'text',
        textType: 'conversation',
        voiceType: 'call',
        limit: LIMIT_INITIAL_VALUE,
        sectionId: initialSectionId,
        speakerIds: [],
    });
    const formDataRef = useRef(formData);
    formDataRef.current = formData;
    const [focusedFields, setFocusedFields] = useState({
        name: false,
        type: false,
        textType: false,
        voiceType: false,
        limit: false,
        speakerIds: false,
        sectionId: false,
    });
    const [formErrors, setFormErrors] = useState(new Set());
    const hasFormError = (formErrors) => formErrors.size > 0;
    const validateForm = (formData) => {
        const formErrors = new Set();
        const nameLength = getNameLength(formData.name);
        if (nameLength === 0) {
            formErrors.add('name');
        }
        if (typeof formData.limit !== 'number') {
            formErrors.add('limit');
        }
        setFormErrors(formErrors);
        return formErrors;
    };
    const handleSetFormData = (key, value) => {
        setFormData((formData) => {
            const newFormData = {
                ...formData,
                [key]: value,
            };
            validateForm(newFormData);
            return newFormData;
        });
    };
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
    const close = useCallback(() => {
        navigate({ ...screenRoute, modal: undefined });
    }, [navigate, screenRoute]);
    const closeWithConfirm = useCallback(() => {
        if (getShouldShowConfirm(formDataRef.current)) {
            return exitConfirmationModal.open();
        }
        close();
    }, [close, getShouldShowConfirm, exitConfirmationModal]);
    return {
        formData,
        setFormData,
        focusedFields,
        setFocusedFields,
        formErrors,
        hasFormError,
        validateForm,
        handleSetFormData,
        isLoadingSubmit,
        setIsLoadingSubmit,
        close,
        closeWithConfirm,
        exitConfirmationModal,
    };
}
export const LIMIT_INITIAL_VALUE = 50;
export const getNameLength = (v) => getLengthWithEmoji(v);
//# sourceMappingURL=useSpaceRoomUpsert.js.map