import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { Div, Flex } from '@vkontakte-internal/vkcom-kit';
import { CallsModal } from '../../components/CallsModal';
import { useLang } from '../../hooks/useLang';
import { useConfig } from '../../services/config';
import styles from './CallManagementModal.module.css';
export const CallManagementModal = ({ title, onCloseModal, hint, actionButtons, footerBefore, isWithBackButton, onBackClick, children, dataTestId, }) => {
    const { getLang } = useLang();
    const { enableNewViewOfMuteActions, enableNewViewOfMuteActionsSferum, sferum: isSferum } = useConfig();
    const hasNewViewOfMuteActions = isSferum ? enableNewViewOfMuteActionsSferum : enableNewViewOfMuteActions;
    return (_jsx(CallsModal, { className: classNames(styles.wrapper, !hasNewViewOfMuteActions && styles.oldWrapper), onClose: onCloseModal, actionButtons: actionButtons, footerHint: hint, backText: isWithBackButton ? getLang('calls_back') : undefined, onBack: onBackClick, title: title, dataTestId: dataTestId, footerBefore: footerBefore, children: _jsx(Div, { className: styles.content, mode: hasNewViewOfMuteActions ? undefined : 'vertical', paddingBottom: 0, paddingTop: 0, spacing: 0, children: _jsx(Flex, { noWrap: true, direction: "column", gap: hasNewViewOfMuteActions ? 8 : 10, children: children }) }) }));
};
//# sourceMappingURL=CallManagementModal.js.map