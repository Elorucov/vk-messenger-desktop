import { useCallback, useEffect } from 'react';
import * as Viewer from '../../core/model/Viewer';
import { useOwner, useViewer } from './misc';
import { useRouter } from '../ui/Router/Router';
import { useModal } from './useModal';
/** Определеяем, что нужно сменить аккаунт */
export const useSuggestToSwitchAccountToEdu = () => {
    const viewer = useViewer();
    const { screenRoute, modal, replace } = useRouter();
    const owner = useOwner();
    const switchToEduAccountModal = useModal();
    const closeSuggestSwitchAccountModal = useCallback(() => {
        if (screenRoute.kind !== 'ChannelRoute' &&
            screenRoute.kind !== 'ConvoRoute' &&
            owner.kind !== 'Group') {
            return;
        }
        replace({ kind: 'MainRoute', organiser: screenRoute.organiser });
        switchToEduAccountModal.isInStack && switchToEduAccountModal.close();
    }, [screenRoute, owner.kind, replace, switchToEduAccountModal]);
    useEffect(() => {
        if ((screenRoute.kind !== 'ChannelRoute' &&
            screenRoute.kind !== 'ConvoRoute') ||
            modal?.kind === 'MiniAppModal') {
            return;
        }
        if (!Viewer.isEdu(viewer.profileType) && screenRoute.sferum) {
            !switchToEduAccountModal.isInStack && switchToEduAccountModal.open();
        }
        else if (!screenRoute.sferum) {
            if (switchToEduAccountModal.isInStack) {
                switchToEduAccountModal.close();
            }
        }
    }, [screenRoute, modal, replace, viewer, switchToEduAccountModal]);
    return {
        isSferumSwitchNeeded: switchToEduAccountModal.isInStack,
        closeSuggestSwitchAccountModal,
    };
};
//# sourceMappingURL=useSuggestToSwitchAccountToEdu.js.map