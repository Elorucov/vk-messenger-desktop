import { isSupported as isVideoVirtualBackgroundSupported } from '@vkontakte/calls-video-effects';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getIsRestrictedConversation, getIsMeAnonym, getIsMeCommunity } from '../../../selectors';
import { getVoiceRoomJoinLink, getVoiceRoomIsAudioMode, getIsMyScreenShare, getVoiceRoomScreenShareOwner, } from '../selectors';
export const useControlsShown = () => {
    const isAudioMode = useTypedSelector(getVoiceRoomIsAudioMode);
    const isMeAnonym = useTypedSelector(getIsMeAnonym);
    const isMeCommunity = useTypedSelector(getIsMeCommunity);
    const isMeListener = useTypedSelector(getIsRestrictedConversation);
    const screenShareOwner = useTypedSelector(getVoiceRoomScreenShareOwner);
    const isMyScreenShare = useTypedSelector(getIsMyScreenShare);
    const joinLink = useTypedSelector(getVoiceRoomJoinLink);
    return {
        isScreenShareStartShown: !isAudioMode && !isMeListener && Boolean(!screenShareOwner || !isMyScreenShare),
        isScreenShareStopShown: !isMeListener && isMyScreenShare,
        isWatchTogetherShown: !isAudioMode && !isMeListener && !isMeAnonym,
        isVmojiShown: !isAudioMode && !isMeAnonym && !isMeListener && !isMeCommunity,
        isCopyJoinLinkShown: !isMeAnonym && !!joinLink,
        isVirtualBackgroundShown: !isMeListener && isVideoVirtualBackgroundSupported(),
    };
};
//# sourceMappingURL=useControlsShown.js.map