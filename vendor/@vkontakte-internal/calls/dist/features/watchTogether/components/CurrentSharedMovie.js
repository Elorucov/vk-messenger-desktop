import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":6}],"img":["global",{"className":1}]} */
import { useCallback, useState } from 'react';
import { Button } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../../hooks/useLang';
import { RemoveMovieModal } from './RemoveMovieModal';
import { getMaxPreview } from '../utils';
export const CurrentSharedMovie = ({ movieInfo, handleRemoveMovie, isRemoveAvailable, onCloseParentModal, }) => {
    const { movieId, title, thumbnails } = movieInfo;
    const moviePreview = getMaxPreview(thumbnails);
    const { getLang } = useLang();
    const [isShowModal, setIsShowModal] = useState(false);
    const onCloseModal = useCallback(() => setIsShowModal(false), []);
    const onOpenModal = useCallback(() => setIsShowModal(true), []);
    const onRemoveMovie = useCallback(() => {
        handleRemoveMovie(movieId).finally(onCloseParentModal);
    }, [handleRemoveMovie, movieId]);
    return (_jsxs("div", { className: "CallsMovieCurrentSharedMovie", children: [_jsx("div", { className: "CallsMovieCurrentSharedMovie__mainTitle", children: getLang('calls_shared_movie_current') }), _jsxs("div", { className: "CallsMovieCurrentSharedMovie__content", children: [_jsx("img", { src: moviePreview.url, alt: "img", className: "CallsMovieCurrentSharedMovie__preview" }), _jsx("div", { className: "CallsMovieCurrentSharedMovie__description", children: _jsx("div", { className: "CallsMovieCurrentSharedMovie__videoTitle", children: title }) }), isRemoveAvailable && (_jsx("div", { className: "CallsMovieCurrentSharedMovie__removeButton", children: _jsx(Button, { mode: "primary", size: "m", onClick: onOpenModal, "data-testid": "calls_watch_together_stop_movie", children: getLang('calls_remove_movie_modal_complete') }) }))] }), isShowModal && isRemoveAvailable && (_jsx(RemoveMovieModal, { type: "endVideo", onClose: onCloseModal, onConfirm: onRemoveMovie }))] }));
};
//# sourceMappingURL=CurrentSharedMovie.js.map