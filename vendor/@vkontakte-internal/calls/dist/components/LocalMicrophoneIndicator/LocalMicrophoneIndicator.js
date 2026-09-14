import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Icon24Voice } from '@vkontakte/icons';
import { CallsEventType } from '@vkontakte-internal/calls-core';
import { IconMicrophoneIndicator } from '@vkontakte-internal/vkcom-kit';
import { eventBus } from '../../services/eventBus';
export function LocalMicrophoneIndicator({ color = 'color_icon_contrast', Icon = Icon24Voice, ...restProps }) {
    const [level, setLevel] = useState(0);
    useEffect(() => {
        const update = ({ level }) => setLevel(Math.floor(level * 100));
        eventBus.on(CallsEventType.LOCAL_MICROPHONE_VOLUME_CHANGED, update);
        return function cleanUp() {
            eventBus.off(CallsEventType.LOCAL_MICROPHONE_VOLUME_CHANGED, update);
        };
    }, []);
    return (_jsx(IconMicrophoneIndicator, { ...restProps, activated: level > 10, color: color, Icon: Icon, level: level }));
}
//# sourceMappingURL=LocalMicrophoneIndicator.js.map