import { useCallsSDK } from '../providers/CallsSdkProvider';
import { useTypedDispatch } from './useTypedDispatch';
import { checkPermissions } from '../permissions';
import { MediaOption } from '@vkontakte/calls-sdk';
import { toggleModal } from '../actions';
import { ModalType } from '@vkontakte-internal/calls-core';
export const useToggleMediaSettingsModal = (onSuccess) => {
    const SDK = useCallsSDK();
    const dispatch = useTypedDispatch();
    return () => checkPermissions(SDK, [MediaOption.AUDIO, MediaOption.VIDEO]).then(() => {
        dispatch(toggleModal(ModalType.SETTINGS));
        onSuccess?.();
    });
};
//# sourceMappingURL=useToggleMediaSettingsModal.js.map