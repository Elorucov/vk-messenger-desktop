import React, { useContext } from 'react';
/**
 * Если где-то не указан конкретный конфиг,
 * то следуем самому консервативному случаю -
 * для нас это фастчаты.
 * Этих параметров должно хватить:
 */
const MINIMAL_LAYOUT_CONFIG = {
    width: 250,
    minHeight: 50,
    maxSingleHeight: 250,
    preferredRatio: 1,
};
const ImagesLayoutContext = React.createContext(MINIMAL_LAYOUT_CONFIG);
export const ImagesLayoutProvider = ImagesLayoutContext.Provider;
export const useImagesLayout = () => {
    const imagesLayout = useContext(ImagesLayoutContext);
    return imagesLayout;
};
//# sourceMappingURL=ImagesLayoutContext.js.map