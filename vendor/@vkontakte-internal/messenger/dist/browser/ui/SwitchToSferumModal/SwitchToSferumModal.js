import '../../ui/ChatInvitationLinkResetModal/ChatInvitationLinkResetModal.css';
import React, { useMemo, useCallback } from 'react';
import { Button } from '@vkontakte/vkui';
import { Icon56Users3Outline } from '@vkontakte/icons';
import { useBrowserEnv, useViewer } from '../../hooks/misc';
import { UnifiedServiceModal } from '../../ui/UnifiedServiceModal/UnifiedServiceModal';
import * as Viewer from '../../../core/model/Viewer';
import { AttentionImage } from '../../ui/AttentionImage/AttentionImage';
import { useRouter } from '../../ui/Router/Router';
/**
 * Модальное окно, умеющее перенаправлять в сферум
 */
export const SwitchToSferumModal = ({ title, subtitle, onClose, registerAccount, handleSetAccount, }) => {
    const { lang } = useBrowserEnv();
    const { navigate, replace, modal, screenRoute } = useRouter();
    const viewer = useViewer();
    const eduAccount = useMemo(() => Viewer.eduAccount(viewer), [viewer]);
    const switchAccount = useCallback(() => {
        if (eduAccount) {
            // для миниапов готовим свой начальный урл
            const resetRoute = modal?.kind === 'MiniAppModal';
            if (resetRoute) {
                navigate({
                    kind: 'MainRoute',
                    modal: [modal],
                    sferum: true,
                });
            }
            handleSetAccount(eduAccount.id, false);
        }
    }, [eduAccount, handleSetAccount, modal, navigate]);
    const onModalClose = useCallback(() => {
        if (onClose) {
            onClose();
            return;
        }
        replace({ kind: 'MainRoute', organiser: screenRoute.organiser });
    }, [onClose, replace, screenRoute]);
    if (Viewer.isEdu(viewer.profileType)) {
        return null;
    }
    if (eduAccount) {
        return (React.createElement(UnifiedServiceModal, { title: title, subtitle: subtitle, image: React.createElement(Icon56Users3Outline, { color: "var(--vkui--color_background_accent_themed)" }), footer: React.createElement(Button, { size: "l", stretched: true, onClick: switchAccount }, lang.use('me_switch_account_to_sferum_modal_move')), handleModalClose: onModalClose }));
    }
    return (React.createElement(UnifiedServiceModal, { title: lang.use('me_register_sferum_account_modal_title'), subtitle: lang.use('me_register_sferum_account_modal_subtitle'), image: React.createElement(AttentionImage, null), footer: React.createElement(Button, { size: "l", stretched: true, onClick: () => registerAccount('edu') }, lang.use('me_register_sferum_account_modal_submit')), handleModalClose: onModalClose }));
};
//# sourceMappingURL=SwitchToSferumModal.js.map