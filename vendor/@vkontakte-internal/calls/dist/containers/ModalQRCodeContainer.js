import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { ModalQRCode } from '../components/ModalQRCode/ModalQRCode';
import { useCloseModal } from '../hooks/useCloseModal';
import { getPhotoMessagesUploadServer, saveMessagesPhoto } from '../services/backend';
import { toggleModal } from '../actions';
import { useTypedDispatch } from '../hooks/useTypedDispatch';
import { ModalType } from '@vkontakte-internal/calls-core';
import { useLang } from '../hooks/useLang';
import { usePromiseError } from '../hooks/usePromiseError';
import { ClickHouseEventType, useSendStatsService } from '../stats/clickHouse';
const emptyFormData = new FormData();
export const ModalQRCodeContainer = ({ textToEncode, qrFileName, onClose, isSferum, detailedDescription, callId, }) => {
    const { getLang, langReplace } = useLang();
    const handleClose = useCloseModal(onClose);
    const dispatch = useTypedDispatch();
    const { handleError } = usePromiseError();
    const sendStats = useSendStatsService();
    const [pngFormData, setPngFormData] = useState(emptyFormData);
    const [isShareLoading, setIsShareLoading] = useState(false);
    let shareMessageText = '';
    if (detailedDescription) {
        const shareMessageCTA = langReplace(getLang('calls_qr_code_modal_share_cta_message'), {
            link: detailedDescription.joinLink,
        });
        shareMessageText = detailedDescription.startText + '\r\n\r\n' + shareMessageCTA;
    }
    const onShared = () => {
        sendStats(ClickHouseEventType.CALL_LINK_QR_CODE_SHARED, {
            session_id: callId,
        });
        handleClose();
    };
    const handleShare = () => {
        setIsShareLoading(true);
        getPhotoMessagesUploadServer()
            .then((response) => {
            return fetch(response.upload_url, {
                method: 'POST',
                body: pngFormData,
            });
        })
            .then((response) => response.json())
            .then((photoParams) => saveMessagesPhoto(photoParams))
            .then((photos) => {
            const photo = photos?.[0];
            if (!photo?.owner_id || !photo?.id) {
                throw new Error('Fail uploading photo');
            }
            dispatch(toggleModal(ModalType.SEND_LINK, {
                title: getLang('calls_share_qr_code'),
                initialText: shareMessageText,
                attachment: `photo${photos?.[0]?.owner_id}_${photos?.[0]?.id}`,
                onClose: handleClose,
                onSendFinish: onShared,
            }));
        })
            .catch(handleError)
            .finally(() => {
            setIsShareLoading(false);
        });
    };
    const handlePng = (formData) => {
        setPngFormData(formData);
    };
    const handleDownload = () => {
        sendStats(ClickHouseEventType.CALL_LINK_QR_CODE_DOWNLOAD, {
            session_id: callId,
        });
    };
    return (_jsx(ModalQRCode, { onClose: handleClose, onShare: handleShare, onDownload: handleDownload, isShareLoading: isShareLoading, onPng: handlePng, textToEncode: textToEncode, qrFileName: qrFileName, isSferum: isSferum }));
};
//# sourceMappingURL=ModalQRCodeContainer.js.map