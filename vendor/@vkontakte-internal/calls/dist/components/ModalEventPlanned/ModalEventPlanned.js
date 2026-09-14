import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { BaseModal } from '../BaseModal/BaseModal';
import { Icon56NotebookCheckOutline } from '@vkontakte/icons';
import { useLang } from '../../hooks/useLang';
import { JoinLink } from './JoinLink';
import { Button, Div, EllipsisText, getColorClass, Interpolate, Link, QRCode, Spacing, Subhead, Title, Tappable, } from '@vkontakte-internal/vkcom-kit';
import { useConfig } from '../../services/config';
import { svgStringToDataUrl } from '@vkontakte-internal/shared';
import { getIcon24LogoSferumColor } from '../../icons/getIcon24LogoSferumColor';
export const ModalEventPlanned = ({ onClose, onCopyText, onCopyJoinLink, onCopyBroadcastLink, onCopyShortLink, onSendByMessage, onQRCodeClick, detailedDescription, eventTitle, dateText, }) => {
    const { getLang, langReplace } = useLang();
    const { enableQRCode, enableQRCodeSferum, enableShortCredentials, enableShortCredentialsSferum, sferum } = useConfig();
    const isShortCredentialsEnabled = (enableShortCredentials && !sferum) || (enableShortCredentialsSferum && sferum);
    const isQrCodeEnabled = (enableQRCode && !sferum) || (enableQRCodeSferum && sferum);
    // не использую vou(), чтобы лишний раз не выполнялась конвертация svg в dataUrl
    const sferumLogoUrl = sferum ? svgStringToDataUrl(getIcon24LogoSferumColor().icon) : undefined;
    const handleClickLink = (event) => {
        const { href } = event.target;
        event.preventDefault();
        event.stopPropagation();
        if (href) {
            window.open(href, '_blank')?.focus();
        }
    };
    const getShortLinkWithPassword = (credentials) => (_jsx(Interpolate, { values: { a: _jsx(Link, { href: credentials.link_without_password, onClick: handleClickLink }) }, children: langReplace(getLang('calls_short_link_with_password_template'), {
            link: `<a>${credentials.link_without_password}</a>`,
            password: credentials.password,
        }) }));
    return (_jsx(BaseModal, { className: "CallsModalEventPlanned", onClose: onClose, enableCrossButton: true, disableBodyScroll: true, label: getLang('calls_event_planned'), children: _jsxs("div", { className: "CallsModalEventPlanned__wrap", children: [_jsx(Icon56NotebookCheckOutline, { className: "CallsModalEventPlanned__icon" }), _jsx(Spacing, { size: 16 }), _jsx(Title, { level: "2", weight: "2", children: getLang('calls_event_planned') }), _jsx(Spacing, {}), _jsx(EllipsisText, { maxWidth: 500, maxLines: 4, children: _jsx(Subhead, { weight: "2", className: getColorClass('color_text_subhead'), children: eventTitle }) }), _jsx(Subhead, { weight: "2", className: getColorClass('color_text_subhead'), children: dateText }), detailedDescription && (_jsxs("div", { className: "CallsModalEventPlanned__preview", children: [_jsxs(Div, { mode: "vertical", paddingTop: 0, paddingBottom: 0, style: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx(Div, { mode: "vertical", paddingTop: 0, paddingBottom: 0, style: { maxWidth: 354 }, children: detailedDescription.startText }), isQrCodeEnabled && (_jsx(Tappable, { "data-testid": "calls_modal_event_planned_qr_btn", "aria-label": getLang('calls_share_qr_code'), borderRadiusMode: "inherit", onClick: onQRCodeClick, children: _jsx(QRCode, { text: detailedDescription.joinLink, size: 72, options: {
                                            isShowLogo: true,
                                            logoData: sferumLogoUrl,
                                        } }) }))] }), _jsx(Spacing, { size: 16 }), _jsx(JoinLink, { link: _jsx(Link, { href: detailedDescription.joinLink, onClick: handleClickLink, children: detailedDescription.joinLink }), onCopyLink: onCopyJoinLink, title: getLang('calls_join_by_link') }), isShortCredentialsEnabled && detailedDescription?.shortCredentials && (_jsxs(_Fragment, { children: [_jsx(Spacing, { size: 12 }), _jsx(JoinLink, { link: getShortLinkWithPassword(detailedDescription.shortCredentials), onCopyLink: onCopyShortLink, title: getLang('calls_short_link_with_password'), description: getLang('calls_event_planned_modal_short_link_description') })] })), detailedDescription.broadcastLink && (_jsxs(_Fragment, { children: [_jsx(Spacing, { size: 12 }), _jsx(JoinLink, { link: _jsx(Link, { href: detailedDescription.broadcastLink, onClick: handleClickLink, children: detailedDescription.broadcastLink }), onCopyLink: onCopyBroadcastLink, title: getLang('calls_join_broadcast_link') })] }))] })), _jsxs("div", { className: "CallsModalEventPlanned__buttons", children: [_jsx(Button, { size: "m", mode: "tertiary", onClick: onSendByMessage, children: getLang('calls_send_text_by_im') }), _jsx(Button, { size: "m", mode: "primary", onClick: onCopyText, children: getLang('calls_copy_invite_text') })] })] }) }));
};
//# sourceMappingURL=ModalEventPlanned.js.map