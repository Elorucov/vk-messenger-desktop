import { useCallback, useState, useRef, useEffect } from 'react';
import { useTypedDispatch } from '../../../hooks/useTypedDispatch';
import { EVideoEffectType } from '../../../constants';
import { ModalType } from '@vkontakte-internal/calls-core';
import { effectStorage } from '../../../helpers/localStorage';
import { toggleModal } from '../../../actions';
/** хук сохраняет значение выбранного элемента меню в карусели фонов */
export const useSettingsItems = ({ backgroundList }) => {
    const dispatch = useTypedDispatch();
    /** выбранная настройка */
    const [chosen, setChosen] = useState(
    /** при монтировании, забираем значение из localStorage */
    effectStorage.getEffect);
    /** коллбек при клике на элемент в настройках фона */
    const onClick = useCallback((effect) => {
        switch (effect.type) {
            case EVideoEffectType.BLUR:
                setChosen(effect);
                break;
            case EVideoEffectType.ADD:
                // модальное окно загрузки фона
                dispatch(toggleModal(ModalType.UPLOAD_BACKGROUND_PHOTO));
                break;
            case EVideoEffectType.NONE:
                setChosen(effect);
                break;
            // background id
            default:
                // если выбранная фотография есть в списке загруженных
                if (backgroundList.some(({ id }) => id === effect.id)) {
                    setChosen(effect);
                }
                break;
        }
    }, [backgroundList]);
    /**
     * при загрузке фотографии на сервер, сохраняем в рефе ссылку
     * на загруженный объект, на следующем рендере `useEffect` увидит
     * изменение коллбека `onClick` и вызовет его с сохраненным фото
     */
    const perspectiveNext = useRef(null);
    /**
     * коллбек для сохранения загруженного на сервер фото для
     * последующего выбора на следующем рендере. __важно__, чтобы
     * коллбек был вызван __до рендера__ с обновленным списком фонов,
     * иначе в эффект попадет старая ссылка
     */
    const onSuccessPhotoUpload = useCallback((photo) => (perspectiveNext.current = photo), []);
    useEffect(() => {
        if (perspectiveNext.current) {
            onClick({
                id: perspectiveNext.current.id,
                type: EVideoEffectType.BACKGROUND,
            });
            perspectiveNext.current = null;
        }
    }, [onClick]);
    return {
        chosen,
        setChosen,
        onClick,
        onSuccessPhotoUpload,
    };
};
//# sourceMappingURL=useSettingsItems.js.map