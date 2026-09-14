import React, { useEffect } from 'react';
import { useDidUpdate, useDispatch, usePrevious, useViewer, } from '../../hooks/misc';
import { useModal, useModalGroup } from '../../hooks/useModal';
import { RightPanel } from '../../ui/RightPanel/RightPanel';
import { ProfileLoader } from '../../ui/ProfileLoader/ProfileLoader';
import { SpaceProfileContent } from '../../ui/SpaceProfileContent/SpaceProfileContent';
export const SpaceProfile = ({ spaceId, space, onClose, }) => {
    const { viewer } = useViewer();
    const dispatch = useDispatch();
    const profileModalGroup = useModalGroup();
    const profileModal = useModal(profileModalGroup.id, 'rightPanel');
    /**
     * Открываем модалку, ориентируясь на маунт компонента
     */
    useEffect(() => {
        profileModal.open();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    /**
     * Загрузка данных профиля в случае если они отсутствуют в кеше
     */
    useEffect(() => {
        if (viewer.id === 0) {
            return;
        }
        // SPC-TODO: Реализовать позже
        // dispatch({
        //   type: 'UserOpenedSpaceProfile',
        //   spaceId,
        // })
    }, [dispatch, viewer, spaceId]);
    const isLoading = !space || space.kind === 'Incomplete';
    const onPanelEscape = () => {
        if (isLoading) {
            return;
        }
        profileModalGroup.closeGroup();
    };
    /**
     * Храним предыдущее значение для того, чтобы понимать на 100%
     * стоит ли вызывать коллбэк закрытия.
     *
     * `typeof previousIndexInStack === 'number'` свидетельствует о том, что
     * профиль был открыт.
     */
    const previousIndexInStack = usePrevious(profileModal.indexInStack);
    /**
     * Обработка закрытия профиля
     */
    useDidUpdate(() => {
        if (typeof previousIndexInStack === 'number' &&
            profileModal.indexInStack === null) {
            onClose?.();
        }
    }, [onClose, previousIndexInStack, profileModal.indexInStack]);
    return (React.createElement(RightPanel, { indexInStack: profileModal.indexInStack, isActive: profileModal.isActive, onEscape: onPanelEscape, className: "RightPanel__profile" }, isLoading ? (React.createElement(ProfileLoader, { type: "Channel" })) : (React.createElement(SpaceProfileContent, { space: space, onPanelEscape: onPanelEscape, profileModalGroupId: profileModalGroup.id }))));
};
//# sourceMappingURL=SpaceProfile.js.map