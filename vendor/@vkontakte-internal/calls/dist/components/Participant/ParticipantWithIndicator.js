import { jsx as _jsx } from "react/jsx-runtime";
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { useParticipantReaction } from './hooks/useParticipantReaction';
import { Participant } from './widget';
import { Provider, useModel } from './ParticipantWithIndicatorModel';
export const ParticipantWithIndicator = observer(function ParticipantWithIndicator() {
    const { deviceId, isMe, isNFT, props } = useModel();
    const reaction = useParticipantReaction(deviceId, isMe);
    return _jsx(Participant, { ...props, reaction: reaction, isNFT: isNFT, isVisible: true });
});
export const ParticipantWithIndicatorWidget = createWidget(Provider, ParticipantWithIndicator);
//# sourceMappingURL=ParticipantWithIndicator.js.map