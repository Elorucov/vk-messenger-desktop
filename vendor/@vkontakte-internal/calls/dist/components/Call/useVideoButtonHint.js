import { useLang } from '../../hooks/useLang';
export const useVideoButtonHint = (isVideoEnabled, isVideoAllowed) => {
    const { getLang } = useLang();
    if (!isVideoAllowed) {
        return getLang('calls_admin_permanent_mute_video');
    }
    return isVideoEnabled ? getLang('calls_camera_turn_off') : getLang('calls_camera_turn_on');
};
//# sourceMappingURL=useVideoButtonHint.js.map