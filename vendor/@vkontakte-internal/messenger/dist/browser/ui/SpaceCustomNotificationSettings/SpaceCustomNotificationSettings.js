import React, { useCallback, useMemo } from 'react';
import { useDispatch } from '../../hooks/misc';
import { Time } from '../../../core/utils/time';
import { CustomNotificationSettings, } from '../../ui/CustomNotificationSettings/CustomNotificationSettings';
export const SpaceCustomNotificationSettings = ({ spaceId, settings, onClose }) => {
    const dispatch = useDispatch();
    const initialState = useMemo(() => {
        if (settings.muteTill === 0) {
            return {
                useSound: settings.useSound,
            };
        }
        return {
            useSound: settings.useSound,
            mute: settings.muteTill === -1
                ? { period: 'forever' }
                : { period: 'custom', until: new Date(settings.muteTill) },
        };
    }, 
    /* eslint-disable-next-line */
    []);
    const handleSave = useCallback((state) => {
        let muteTill;
        switch (state.mute?.period) {
            case '1hour':
                muteTill = Date.now() + Time.Hour;
                break;
            case '8hours':
                muteTill = Date.now() + 8 * Time.Hour;
                break;
            case '1day':
                muteTill = Date.now() + Time.Day;
                break;
            case '1week':
                muteTill = Date.now() + Time.Week;
                break;
            case 'forever':
                muteTill = -1;
                break;
            case 'custom':
                muteTill = state.mute.until.getTime();
                break;
            default:
                muteTill = 0;
        }
        dispatch({
            type: 'UserChangedSpaceMute',
            spaceId,
            muteTill,
            useSound: state.useSound,
        });
        onClose();
    }, [spaceId, dispatch, onClose]);
    return (React.createElement(CustomNotificationSettings, { initialState: initialState, onSave: handleSave, onClose: onClose }));
};
//# sourceMappingURL=SpaceCustomNotificationSettings.js.map