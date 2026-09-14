import { jsx as _jsx } from "react/jsx-runtime";
import { memo } from 'react';
import { VideoCard } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../../hooks/useLang';
import { useCloseModal } from '../../../hooks/useCloseModal';
import { DigitPlace, getFormattedCount, getMovieBackgroundUrl } from '../utils';
import { useMovieDate } from '../hooks/useMovieDate';
import { TARGET_SIZE } from '../constants';
import { useMovieOwnerUrl } from '../hooks/useMovieOwnerUrl';
/** карточка мувика в списке-гриде */
/**
 * todo: создать компонент vkcom-kit так как много кастомных стилей
 * @link: https://jira.mvk.com/browse/CALL-23799
 */
const MovieTileComponent = ({ movie, group, profile, onClick, navigateToProfile }) => {
    const closeModal = useCloseModal();
    const { getLang } = useLang();
    const url = getMovieBackgroundUrl({
        targetSize: TARGET_SIZE,
        image: movie.image,
    });
    const dateString = useMovieDate(movie.date);
    const channelUrl = useMovieOwnerUrl(group, profile);
    const onChannelLinkClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (channelUrl && navigateToProfile) {
            navigateToProfile(event, channelUrl);
            closeModal();
        }
    };
    const onMovieTileClick = () => {
        onClick?.(movie);
    };
    const getViews = (views) => {
        const formattedViews = getFormattedCount(views);
        switch (formattedViews.digitPlace) {
            case DigitPlace.Billions:
                return `${formattedViews.value}${getLang('calls_movie_N_views_billion')}`;
            case DigitPlace.Millions:
                return `${formattedViews.value}${getLang('calls_movie_N_views_million')}`;
            case DigitPlace.Thousands:
                return `${formattedViews.value}${getLang('calls_movie_N_views_thousand')}`;
        }
        return getLang('calls_movie_views_count', movie.views);
    };
    const isAvailable = Boolean(movie.ov_id);
    const views = movie.views ? getViews(movie.views) : '';
    const date = dateString ? `· ${dateString}` : '';
    const additionalInfo = `${views}${date}`;
    const profileName = profile ? `${profile.first_name} ${profile.last_name}` : '';
    const ownerName = group?.name || profileName || '';
    return (
    // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/check-required-props-usage
    _jsx(VideoCard, { noAvatar: true, onVideoOpen: onMovieTileClick, onAuthorClick: onChannelLinkClick, video: {
            duration: movie.duration,
            title: movie?.title || '',
            description: movie.description,
            additionalInfo,
            owner: {
                name: ownerName,
                href: '',
            },
            thumbSrc: url,
            trailerSrc: movie.trailer?.mp4_360,
            restriction: !isAvailable
                ? {
                    mode: 'blurred',
                    title: getLang('calls_movies_is_not_available_yet'),
                }
                : undefined,
            isLive: !!movie.live_status && !movie.duration,
        } }));
};
export const MovieTile = memo(MovieTileComponent);
//# sourceMappingURL=MovieTile.js.map