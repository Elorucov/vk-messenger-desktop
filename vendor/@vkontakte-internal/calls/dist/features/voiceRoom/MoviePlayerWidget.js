import { jsx as _jsx } from "react/jsx-runtime";
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { MoviePlayer } from '../../components/MoviePlayer/MoviePlayer';
import { Provider, useModel } from './MoviePlayerModel';
const MoviePlayerContainer = observer(function MoviePlayerContainer() {
    const { watchTogetherActionsService, movieState, watchTogetherDevice: device, isMeCanManageWatchTogether, isMovieOwner, } = useModel();
    if (!device ||
        !device.movieStream ||
        !device.movieStreamInfo ||
        device.streamMode === null ||
        device.streamMode === undefined ||
        !movieState) {
        return null;
    }
    const { movieStream, movieStreamInfo } = device;
    return (_jsx(MoviePlayer, { className: "CallsVoiceRoomMoviePlayer", title: movieStreamInfo?.title, vkMovieId: movieStreamInfo?.movieId, current: movieState?.offset || 0, volumeValue: movieState?.gain, isPlayed: !movieState?.pause, isMuted: movieState?.mute, total: movieStreamInfo?.duration, streamData: {
            type: device.streamMode,
            data: movieStream,
        }, onPause: watchTogetherActionsService.handleMoviePause, onPlay: watchTogetherActionsService.handleMoviePlay, onRewind: watchTogetherActionsService.handleMovieRewind, onChangeVolume: watchTogetherActionsService.handleMovieSoundChange, onMute: watchTogetherActionsService.handleMovieMute, onUnMute: watchTogetherActionsService.handleMovieUnMute, onRemove: watchTogetherActionsService.handleRemoveMovie, isEditable: isMeCanManageWatchTogether, mode: movieStreamInfo.source, isMovieStreamEnabled: true, isMovieOwner: isMovieOwner }));
});
export const MoviePlayerWidget = createWidget(Provider, MoviePlayerContainer);
//# sourceMappingURL=MoviePlayerWidget.js.map