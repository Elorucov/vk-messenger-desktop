import { jsx as _jsx } from "react/jsx-runtime";
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getIsLocalAudioEnabled, getIsMiniApp } from '../../../selectors';
import { useToggleAudio } from '../../../hooks/useToggleAudio';
import { useCallback } from 'react';
import { MicrophoneIcon } from '../components/MicrophoneIcon';
import { useLang } from '../../../hooks/useLang';
export function useCreateMicToggleButton(redesign, isAudioAllowed) {
    const { getLang } = useLang();
    const isMiniApp = useTypedSelector(getIsMiniApp);
    const isLocalAudioEnabled = useTypedSelector(getIsLocalAudioEnabled);
    const isLocalAudioAllowed = isAudioAllowed || isLocalAudioEnabled;
    const { handleToggleAudio, isAudioToggleProcessing } = useToggleAudio();
    return useCallback(() => ({
        dataTestId: 'calls_call_widget_button_mic',
        tooltip: isLocalAudioEnabled ? getLang('calls_mute') : getLang('calls_unmute'),
        disabled: !isLocalAudioAllowed || isAudioToggleProcessing,
        children: (_jsx(MicrophoneIcon, { isAudioEnabled: isLocalAudioEnabled, isMiniApp: isMiniApp, redesign: redesign })),
        onClick: handleToggleAudio,
    }), [
        isLocalAudioEnabled,
        isLocalAudioAllowed,
        isMiniApp,
        handleToggleAudio,
        isAudioToggleProcessing,
        redesign,
    ]);
}
//# sourceMappingURL=useCreateMicToggleButton.js.map