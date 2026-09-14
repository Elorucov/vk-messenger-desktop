import { jsx as _jsx } from "react/jsx-runtime";
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
import { isSameExternalId, externalIdToString, getDefaultExternalId, getMiniAppIdSharedFromDevice, getSharedMiniHashFromUrl, mergeGroupToParticipant, } from '@vkontakte-internal/calls-core';
import { MediaType } from '@vkontakte/calls-sdk';
import { MoviePlayer } from '../MoviePlayer/MoviePlayer';
import { useLang } from '../../hooks/useLang';
import { vou } from '../../helpers/helpers';
import { MiniAppWidget } from '../../features/miniApps';
import { VideoZoomContainer } from '../../features/videoZoom';
import { getSingleLetter, getStream, isParticipantAnonym } from '../../helpers/participant';
import { getUserName } from '../../helpers/user';
import { Participant, ParticipantAppearance } from '../Participant';
import { Provider, useModel } from './CallOratorMainModel';
import { OratorIframe } from './OratorIframe';
// Компонент отвечает за рендер Оратора в звонке (Аватарка, камера, мувик, шара)
const OratorMain = observer(function OratorMain() {
    const { isMeCanManageWatchTogether, props, watchTogetherActionsService, isMovieOwner } = useModel();
    const { onStopScreenShare, orator, handleShowCallControls, watchTogetherMovieState, localExternalId, me, groupId, meGroup, isServerTopology, } = props;
    const { getLang } = useLang();
    let { device, participant } = orator;
    const { movieStreamInfo, movieStream, sharedUrl, streamMode } = device;
    const sharedMiniAppId = getMiniAppIdSharedFromDevice(device);
    let isMe;
    let key;
    let externalId;
    if ('externalId' in device) {
        isMe = isSameExternalId(device.externalId, localExternalId);
        key = externalIdToString(device.externalId);
        externalId = device.externalId;
    }
    else {
        isMe = participant?.peerId === me;
        key = participant?.peerId;
        externalId = localExternalId || getDefaultExternalId();
    }
    if (isMe && groupId && meGroup) {
        participant = participant && mergeGroupToParticipant(meGroup, participant);
    }
    const streamData = useMemo(() => getStream(device, { animojiBackendRender: !isMe && isServerTopology }), [device, isMe, isServerTopology]);
    const isMovieStreamShown = movieStream && movieStreamInfo && (streamMode === MediaType.MOVIE || streamMode === MediaType.STREAM);
    const name = getUserName(participant);
    return sharedMiniAppId ? (_jsx(MiniAppWidget, { appId: sharedMiniAppId, hash: sharedUrl && getSharedMiniHashFromUrl(sharedUrl), isAnonym: isParticipantAnonym(me) })) : sharedUrl ? (
    /* Legacy */
    _jsx(OratorIframe, { src: sharedUrl })) : isMovieStreamShown ? (_jsx(MoviePlayer, { isMovieOwner: isMovieOwner, title: movieStreamInfo?.title, vkMovieId: movieStreamInfo?.movieId, current: watchTogetherMovieState?.offset || 0, volumeValue: watchTogetherMovieState?.gain, isPlayed: !watchTogetherMovieState?.pause, isMuted: watchTogetherMovieState?.mute, total: movieStreamInfo?.duration, streamData: streamData, onPause: watchTogetherActionsService.handleMoviePause, onPlay: watchTogetherActionsService.handleMoviePlay, onRewind: watchTogetherActionsService.handleMovieRewind, onChangeVolume: watchTogetherActionsService.handleMovieSoundChange, onMute: watchTogetherActionsService.handleMovieMute, onUnMute: watchTogetherActionsService.handleMovieUnMute, onRemove: watchTogetherActionsService.handleRemoveMovie, isEditable: isMeCanManageWatchTogether, handleShowCallControls: handleShowCallControls, isMovieStreamEnabled: true, mode: movieStreamInfo.source })) : (_jsx(VideoZoomContainer, { streamMode: streamMode ?? undefined, children: _jsx(Participant, { appearance: ParticipantAppearance.ORATOR, externalId: externalId, isOrator: true, isMe: isMe, photo: participant?.photo, name: isMe ? getLang('calls_own_label') : name, letter: getSingleLetter(name), gender: participant?.sex, status: device.status, onStopScreenShare: onStopScreenShare, isNFT: vou(!meGroup, participant?.is_nft), photoSize: 200 }, key) }));
});
export const CallOratorMainWidget = createWidget(Provider, OratorMain);
//# sourceMappingURL=OratorMain.js.map