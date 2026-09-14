import '../../ui/ChatInvitationLinkQrTabContent/ChatInvitationLinkQrTabContent.css';
import React, { useRef, useEffect } from 'react';
import QRCodeGenerator from '@vkontakte/vk-qr';
import { Button } from '@vkontakte/vkui';
import { Icon20DownloadOutline, Icon20ShareOutline } from '@vkontakte/icons';
import * as Viewer from '../../../core/model/Viewer';
import { useBrowserEnv, useViewer } from '../../hooks/misc';
import { blobToImageUrl } from '../../utils/files';
import { ChatInvitationLinkTab } from '../../ui/ChatInvitationLink/ChatInvitationLink';
import { SferumLogo } from '../../ui/SferumLogo/SferumLogo';
export const QR_TAB_PANEL_ID = 'invite_link_qr_panel';
export const QR_TAB_PANEL_CONTROL_ID = 'invite_link_qr_panel_control';
/**
 * Ширина и высота QR-кода в пикселях.
 */
const DEFAULT_QR_CODE_SIZE = 1800;
/**
 * Панель с ссылкой-приглашением в чат в виде QR-кода.
 */
export const ChatInvitationLinkQrTabContent = ({ canEdit, currentLink = '', forwardModal, resetModal }) => {
    const { lang } = useBrowserEnv();
    const { profileType } = useViewer();
    const isEdu = Viewer.isEdu(profileType);
    const customLogo = useRef(null);
    /**
     * Кастомный логотип в виде base64 для вставки в QR-код.
     */
    const customLogoData = useRef(null);
    /**
     * Контейнер, в который встраивается svg с QR-кодом.
     */
    const container = useRef(null);
    const generateCode = useRef(createQrCodeGenerator());
    const [beforeResetLink, afterResetLink] = lang
        .use('me_invite_link_reset_explainer', {
        values: {
            reset_link: ' {reset_link}',
        },
    })
        .split('{reset_link}');
    /**
     * Закэшированные данные для скачивания / шаринга ссылки в виде QR-кода.
     */
    const cachedData = useRef(null);
    /**
     * `<svg />` -> `<canvas />` -> нужные данные.
     */
    const extractData = (size = DEFAULT_QR_CODE_SIZE) => new Promise((resolve, reject) => {
        // Возвращаем закэшированные данные.
        if (cachedData.current)
            return resolve(cachedData.current);
        if (!container.current)
            return reject();
        const svgHtml = container.current.innerHTML;
        if (!svgHtml)
            return reject();
        const svgBlob = new Blob([svgHtml], {
            type: 'image/svg+xml',
        });
        const svgBlobUrl = blobToImageUrl({ blob: svgBlob });
        const img = new Image();
        img.addEventListener('load', () => {
            if (!container.current)
                return reject();
            /**
             * @todo Перейти на `OffscreenCanvas`, когда появится адекватная поддержка.
             */
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = size;
            const ctx = canvas.getContext('2d', { alpha: false });
            if (!ctx)
                return reject();
            // Заполняем фон скачиваемого QR-кода сплошным цветом.
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, size, size);
            // Создаём отступы от краёв (~7%).
            const imageMargin = Math.floor((size * 7) / 100);
            const imageSize = size - imageMargin * 2;
            // Отрисовываем QR-код.
            ctx.drawImage(img, imageMargin, imageMargin, imageSize, imageSize);
            URL.revokeObjectURL(svgBlobUrl);
            const mime = 'image/png';
            const filename = 'download.png';
            const quality = 1;
            const url = canvas.toDataURL(mime, quality);
            canvas.toBlob((blob) => {
                if (!blob)
                    return reject();
                const data = [url, filename, mime, blob];
                // Кэшируем данные.
                cachedData.current = data;
                resolve(data);
            }, mime, quality);
        });
        img.src = svgBlobUrl;
    });
    const downloadCode = async () => {
        const data = await extractData();
        if (!data)
            return;
        const [url, filename] = data;
        const anchor = document.createElement('a');
        anchor.download = filename;
        anchor.href = url;
        anchor.target = '_blank';
        anchor.style.display = 'none';
        // Некоторые версии браузеров не позволяют запустить скачивание без
        // пребывания элемента в DOM.
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
    };
    const forwardCode = async () => {
        if (!forwardModal.current)
            return;
        const data = await extractData();
        if (!data)
            return;
        const [, filename, mime, blob] = data;
        forwardModal.current.open({
            kind: ChatInvitationLinkTab.QR,
            filename,
            mime,
            data: blob,
            link: currentLink,
        });
    };
    // Генерируем и отображаем QR-код.
    useEffect(() => {
        // Вычищаем предыдущие данные - не даём использовать устаревший QR-код.
        if (cachedData.current)
            cachedData.current = null;
        // Перегоняем кастомный логотип в base64 для дальнейшей его вставки через
        // IRI-ссылку в QR-код.
        customLogoData.current = customLogo.current
            ? `data:image/svg+xml;base64,${window.btoa(customLogo.current.outerHTML)}`
            : null;
        window.requestAnimationFrame(() => {
            if (!container.current)
                return;
            container.current.innerHTML = generateCode.current(currentLink, {
                logoData: customLogoData.current,
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentLink]);
    return (React.createElement("div", { id: QR_TAB_PANEL_ID, tabIndex: 0, "aria-labelledby": QR_TAB_PANEL_CONTROL_ID, className: "ChatInvitationLinkQrTabContent" },
        isEdu && (React.createElement(SferumLogo, { ref: customLogo, width: "800", height: "800", 
            // Имитируем отступы, чтобы соответствовать стандартному логотипу.
            transform: "scale(0.78)", className: "ChatInvitationLinkQrTabContent__customLogo" })),
        React.createElement("div", { className: "ChatInvitationLinkQrTabContent__qrWrapper" },
            React.createElement("div", { ref: container, className: "ChatInvitationLinkQrTabContent__qrBackground" })),
        canEdit && (React.createElement("div", { className: "ChatInvitationLinkQrTabContent__linkResetWrapper" },
            beforeResetLink,
            React.createElement("button", { className: "ChatInvitationLinkQrTabContent__linkReset", onClick: () => {
                    if (!resetModal?.current) {
                        return;
                    }
                    resetModal.current.open();
                } }, lang.use('me_invite_link_reset_qr')),
            afterResetLink)),
        currentLink && (React.createElement("div", { className: "ChatInvitationLinkQrTabContent__buttonWrapper" },
            React.createElement(Button, { mode: "secondary", size: "l", stretched: true, before: React.createElement(Icon20DownloadOutline, null), onClick: () => void downloadCode() }, lang.use('me_invite_link_qr_download')),
            React.createElement(Button, { mode: "secondary", size: "l", stretched: true, onClick: () => void forwardCode(), before: React.createElement(Icon20ShareOutline, null) }, lang.use('me_invite_link_forward'))))));
};
/**
 * Создаёт генератор svgшек с простейшим кэшем, что позволит избежать тяжёлых
 * перегенераций.
 */
function createQrCodeGenerator() {
    const cache = new Map();
    return function generateQrCode(link, options = {}) {
        const cacheKey = JSON.stringify({
            ...options,
            link,
        });
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey) ?? '';
        }
        const { logoData } = options;
        const result = QRCodeGenerator.createQR(link, {
            className: 'ChatInvitationLinkQrTabContent__qr',
            ecc: 3,
            foregroundColor: '#000000',
            isShowLogo: true,
            logoData,
        });
        cache.set(cacheKey, result);
        return result;
    };
}
//# sourceMappingURL=ChatInvitationLinkQrTabContent.js.map