import { useCallback, useEffect, useState } from 'react';
import { CallChangeNameStorage } from '../helpers/localStorage';
import { CallByNameProfileType } from '../constants';
import { eventBus } from '../services/eventBus';
import { CallsEventType, peerIdToVkId } from '@vkontakte-internal/calls-core';
import { isEqual } from '@vkontakte/vkjs';
import { decode } from '../utils/textUtils';
/** хук для использования опций для смены имени в звонке */
export const useChangeNameOptions = (participantMe) => {
    let initialNameOptions = {};
    const currentUserVkId = peerIdToVkId(participantMe.peerId);
    if (participantMe) {
        initialNameOptions = {
            id: currentUserVkId,
            name: decode(`${participantMe.firstName} ${participantMe.lastName}`),
            type: CallByNameProfileType.PROFILE,
        };
    }
    const [nameOptions, setNameOptions] = useState(CallChangeNameStorage.getOptions(currentUserVkId) || initialNameOptions);
    const changeNameOptions = useCallback((options) => {
        if (!isEqual(options, nameOptions)) {
            CallChangeNameStorage.saveOptions(currentUserVkId, options || initialNameOptions);
            eventBus.emit(CallsEventType.NAME_CHANGED);
        }
    }, [nameOptions, participantMe]);
    const onChangeStorage = () => {
        setNameOptions(CallChangeNameStorage.getOptions(currentUserVkId) || {});
    };
    useEffect(() => {
        eventBus.on(CallsEventType.NAME_CHANGED, onChangeStorage);
        return () => eventBus.off(CallsEventType.NAME_CHANGED, onChangeStorage);
    }, []);
    return {
        nameOptions,
        changeNameOptions,
    };
};
//# sourceMappingURL=useChangeNameOptions.js.map