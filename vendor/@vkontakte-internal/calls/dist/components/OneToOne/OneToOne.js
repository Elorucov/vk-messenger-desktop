import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"main":["global",{"className":3}],"aside":["global",{"className":1}],"div":["global",{"className":1}]} */
import { classNames as cx } from '@vkontakte/vkjs';
import { Participant, ParticipantAppearance } from '../Participant';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useLang } from '../../hooks/useLang';
import { getPeerIdDeviceInfo, isParticipantWithMovie, getSingleLetter, isParticipantAnonym, } from '../../helpers/participant';
import { CallSubtitles } from '../../features/callSubtitles';
import { getUserName } from '../../helpers/user';
import { isParticipantWithVideo, getMiniAppIdSharedFromDevice, getSharedMiniHashFromUrl, } from '@vkontakte-internal/calls-core';
import { MiniAppWidget } from '../../features/miniApps';
import { createParticipantSelector, getDevices, getMyDevice, getMyExternalId, getMyId, getPeerId, } from '../../selectors';
import { OratorIframe } from '../CallOrator/OratorIframe';
export const OneToOne = ({ isFullScreen, isSubtitlesEnabled }) => {
    const { getLang } = useLang();
    const localDevice = useTypedSelector(getMyDevice);
    const myPeerId = useTypedSelector(getMyId);
    const externalId = useTypedSelector(getMyExternalId);
    const devices = useTypedSelector(getDevices);
    const peer = useTypedSelector(getPeerId);
    const meParticipant = useTypedSelector(createParticipantSelector(myPeerId));
    const peerParticipant = useTypedSelector(createParticipantSelector(peer));
    const meHasVideo = isParticipantWithVideo(localDevice) || isParticipantWithMovie(localDevice);
    const mySharedMiniAppId = getMiniAppIdSharedFromDevice(localDevice);
    const peerDevice = getPeerIdDeviceInfo(peer, devices);
    const peerSharedMiniAppId = peerDevice && getMiniAppIdSharedFromDevice(peerDevice);
    const peerHasMedia = !!((peerDevice && (isParticipantWithVideo(peerDevice) || isParticipantWithMovie(peerDevice))) ||
        peerSharedMiniAppId);
    const sharedMiniAppId = peerSharedMiniAppId ?? mySharedMiniAppId;
    const sharedUrl = peerDevice?.sharedUrl || localDevice.sharedUrl;
    const classes = cx('OneToOne', {
        'OneToOne--hasVideo': meHasVideo,
        'OneToOne--opponentHasMedia': peerHasMedia,
        'OneToOne--subtitles': isSubtitlesEnabled,
    });
    const appearance = ParticipantAppearance.ONE_TO_ONE;
    const render = () => {
        if (sharedMiniAppId) {
            return (_jsx("main", { className: "OneToOne__remote", children: _jsx(MiniAppWidget, { appId: sharedMiniAppId, hash: sharedUrl && getSharedMiniHashFromUrl(sharedUrl), isAnonym: isParticipantAnonym(myPeerId) }) }));
        }
        else if (sharedUrl) {
            return (_jsx("main", { className: "OneToOne__remote", children: _jsx(OratorIframe, { src: sharedUrl }) }));
        }
        else {
            return (_jsxs(_Fragment, { children: [_jsx("aside", { className: "OneToOne__local", "data-testid": "calls_p2p_media_local", children: externalId && meParticipant && (_jsx(Participant, { appearance: appearance, externalId: externalId, isMe: true, name: getLang('calls_own_label'), letter: getSingleLetter(getUserName(meParticipant)), gender: meParticipant.sex, isNFT: meParticipant.is_nft, photoSize: peerHasMedia ? 80 : 200 })) }), _jsx("main", { className: "OneToOne__remote", "data-testid": "calls_p2p_media_remote", children: peerParticipant && peerDevice && (_jsx(Participant, { appearance: appearance, externalId: peerDevice.externalId, photo: peerParticipant.photo, name: peerParticipant.name, gender: peerParticipant.sex, isNFT: peerParticipant.is_nft })) })] }));
        }
    };
    return (_jsxs("div", { className: classes, children: [render(), isSubtitlesEnabled && _jsx(CallSubtitles, { isFullScreen: isFullScreen })] }));
};
//# sourceMappingURL=OneToOne.js.map