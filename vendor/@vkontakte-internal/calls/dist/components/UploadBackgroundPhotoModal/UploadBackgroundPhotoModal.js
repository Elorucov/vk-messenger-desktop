import { jsx as _jsx } from "react/jsx-runtime";
import { CallsModal } from '../../components/CallsModal';
import { useLang } from '../../hooks/useLang';
export const UploadBackgroundPhotoModal = ({ children, onClose }) => {
    const { getLang } = useLang();
    return (_jsx(CallsModal, { onClose: onClose, title: getLang('calls_upload_image_for_background'), className: "UploadBackgroundPhotoModal", footerHint: getLang('calls_if_you_have_problems_with_upload'), children: children }));
};
//# sourceMappingURL=UploadBackgroundPhotoModal.js.map