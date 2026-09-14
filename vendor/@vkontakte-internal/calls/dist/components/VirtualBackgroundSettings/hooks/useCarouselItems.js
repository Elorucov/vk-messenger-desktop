import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo, useCallback, useEffect } from 'react';
import { ItemNoBackground } from '../ItemNoBackground/ItemNoBackground';
import { ItemBlur } from '../ItemBlur/ItemBlur';
import { ItemAddImage } from '../ItemAddImage/ItemAddImage';
import { ItemBackground } from '../ItemBackground/ItemBackground';
import { EVideoEffectType } from '../../../constants';
import { useIsAnonymous } from '../../../hooks/useIsAnonymous';
export const useCarouselItems = ({ onDeleteBackground, backgroundList, chosen, onUpdateVideoEffectsSettings, onChooseBackground, isSferum, }) => {
    const { isAnonymous } = useIsAnonymous();
    /** on-mount */
    useEffect(() => {
        if (chosen.type !== EVideoEffectType.NONE) {
            onUpdateVideoEffectsSettings(chosen);
        }
    }, []);
    const handleOnClick = useCallback((effect) => {
        onChooseBackground(effect);
        onUpdateVideoEffectsSettings(effect);
    }, [onChooseBackground, onUpdateVideoEffectsSettings]);
    /** фотографии из альбома, отмапанные в элементы меню */
    const backgroundItems = useMemo(() => {
        return backgroundList.map((photo) => {
            return {
                id: photo.id,
                effect: {
                    id: photo.id,
                    type: photo.type,
                },
                onClick: handleOnClick,
                content: (_jsx(ItemBackground, { checked: chosen.id === photo.id, backgroundUrl: photo.previewUrl, onDelete: onDeleteBackground, photoId: photo.id, isPredefinedBackground: photo.isPredefined, isStarBackground: photo.tags?.includes('star') })),
            };
        });
    }, [chosen, backgroundList, handleOnClick]);
    const carouselItems = useMemo(() => {
        const result = [
            {
                effect: {
                    id: EVideoEffectType.NONE,
                    type: EVideoEffectType.NONE,
                },
                onClick: handleOnClick,
                content: _jsx(ItemNoBackground, { checked: chosen.type === EVideoEffectType.NONE }),
            },
            {
                effect: {
                    id: EVideoEffectType.BLUR,
                    type: EVideoEffectType.BLUR,
                },
                onClick: handleOnClick,
                content: _jsx(ItemBlur, { checked: chosen.type === EVideoEffectType.BLUR }),
            },
        ];
        // на сферуме не добавляем другие фоны и возможность загрузки фона
        if (isSferum) {
            return result;
        }
        if (!isAnonymous) {
            result.push({
                effect: {
                    id: EVideoEffectType.ADD,
                    type: EVideoEffectType.ADD,
                },
                onClick: handleOnClick,
                content: _jsx(ItemAddImage, {}),
            });
        }
        result.push(...backgroundItems);
        return result;
    }, [chosen, backgroundItems, handleOnClick]);
    return {
        carouselItems,
    };
};
//# sourceMappingURL=useCarouselItems.js.map