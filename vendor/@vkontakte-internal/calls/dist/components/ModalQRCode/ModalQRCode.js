import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Div":["@vkontakte-internal/vkcom-kit",{"style":2}],"QRCode":["@vkontakte-internal/vkcom-kit",{"style":1}]} */
import { useEffect, useRef, useState } from 'react';
import { BaseModal } from '../BaseModal/BaseModal';
import { Icon20ShareOutline, Icon20DownloadOutline } from '@vkontakte/icons';
import { useLang } from '../../hooks/useLang';
import { Button, QRCode, ButtonGroup, Div, useAppearanceDetector } from '@vkontakte-internal/vkcom-kit';
import { svgStringToDataUrl } from '@vkontakte-internal/shared';
import styles from './ModalQRCode.module.css';
import { getIcon24LogoSferumColor } from '../../icons/getIcon24LogoSferumColor';
const QR_CODE_RENDERING_TIMEOUT_MS = 500;
export const ModalQRCode = ({ onClose, onShare, onDownload, onPng, isShareLoading, textToEncode, qrFileName, isSferum = false, }) => {
    const { getLang } = useLang();
    const qrCodeRef = useRef(null);
    const [qrUrl, setQrUrl] = useState();
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const appearance = useAppearanceDetector();
    // не использую vou(), чтобы лишний раз не выполнялась конвертация svg в dataUrl
    const sferumLogoUrl = isSferum ? svgStringToDataUrl(getIcon24LogoSferumColor().icon) : undefined;
    // конвертируем элемент QR-кода в PNG для загрузки и пересылки
    useEffect(() => {
        // у компонента QRCode отсутствует коллбек завершения рендеринга, поэтому используем небольшой таймаут
        const initialTimeout = window.setTimeout(() => {
            if (!qrCodeRef.current) {
                return;
            }
            const svgElement = qrCodeRef.current.querySelector('svg');
            if (!svgElement) {
                return;
            }
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const url = svgStringToDataUrl(svgData);
            // создаем элемент Image для отрисовки на канвасе
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return;
                }
                // увеличиваем измерения в 2 раза для лучшего качества полученного png
                canvas.width = Math.round(img.width * 3);
                canvas.height = Math.round(img.height * 3);
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                // получаем blob для загрузки на сервер VK через FormData
                canvas.toBlob((blob) => {
                    const formData = new FormData();
                    blob && formData.append('photo', blob, qrFileName);
                    onPng(formData);
                }, 'image/png');
                // получаем dataURL для скачивания через элемент <a>
                setQrUrl(canvas.toDataURL('image/png'));
                setIsInitialLoading(false);
            };
            img.src = url;
        }, QR_CODE_RENDERING_TIMEOUT_MS);
        return () => {
            window.clearTimeout(initialTimeout);
        };
    }, []);
    return (_jsx(BaseModal, { className: styles.root, onClose: onClose, enableCrossButton: true, disableBodyScroll: true, label: getLang('calls_event_planned'), children: _jsxs(Div, { style: { padding: 24 }, children: [_jsx(Div, { style: { padding: '20px 66px 32px' }, getRootRef: qrCodeRef, children: _jsx(QRCode, { "data-testid": "calls_qr_code_modal_qr_code", text: textToEncode, size: 220, mode: appearance === 'dark' ? 'contrast' : 'transparent', options: {
                            isShowLogo: true,
                            logoData: sferumLogoUrl,
                        }, style: { margin: '0 auto' } }) }), _jsx(Div, { mode: "vertical", spacing: 0, paddingBottom: 0, children: _jsxs(ButtonGroup, { gap: "s", mode: "vertical", stretched: true, children: [_jsx(Button, { "data-testid": "calls_qr_code_modal_share_btn", onClick: onShare, size: "m", appearance: "accent", stretched: true, before: _jsx(Icon20ShareOutline, {}), loading: isShareLoading, disabled: isInitialLoading, children: getLang('calls_qr_code_modal_share') }), _jsx(Button, { "data-testid": "calls_qr_code_modal_download_btn", size: "m", appearance: "accent", stretched: true, mode: "link", download: qrFileName, href: qrUrl, Component: "a", before: _jsx(Icon20DownloadOutline, {}), disabled: isInitialLoading, onClick: onDownload, children: getLang('calls_qr_code_modal_download') })] }) })] }) }));
};
//# sourceMappingURL=ModalQRCode.js.map