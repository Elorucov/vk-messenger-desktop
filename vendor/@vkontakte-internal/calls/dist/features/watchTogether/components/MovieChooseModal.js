import { jsx as _jsx } from "react/jsx-runtime";
import { CallsModal } from '../../../components/CallsModal';
import { useCloseModal } from '../../../hooks/useCloseModal';
import { useLang } from '../../../hooks/useLang';
export const MovieChooseModal = ({ isAlbumChosen, resetAlbumChosen, children }) => {
    const { getLang } = useLang();
    const onClose = useCloseModal();
    const title = isAlbumChosen ? '' : getLang('calls_movie_choose_title');
    return (_jsx(CallsModal, { className: "MovieChooseModal", onClose: onClose, onBack: resetAlbumChosen, backText: isAlbumChosen && getLang('calls_movie_choose_title_albums'), title: title, hasScroll: false, dataTestId: "calls_watch_together_modal", children: children }));
};
//# sourceMappingURL=MovieChooseModal.js.map