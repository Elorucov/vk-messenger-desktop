import { browser } from '../../utils/misc';
import { areAudios, areImages, arePreviewable, areVideos, haveDirectory, } from '../../../data/env/Uploader';
import { useCallback, useState } from 'react';
export const useDropAreaState = () => {
    const [dropAreaState, setDropAreaState] = useState({});
    const hideDropArea = useCallback(() => setDropAreaState({}), []);
    const handleDragEnter = useCallback((e) => {
        if (browser.touch) {
            return;
        }
        const { items } = e.dataTransfer;
        const itemsArray = Array.from(items)
            /**
             * Фикс для Firefox и проверяем, что перетаскиваем файл, а не элемент интерфейса
             */
            .filter(({ type, kind }) => type !== 'text/uri-list' && kind !== 'string');
        /**
         * Сафари уникальный браузер.
         * В его настройках конфиденциальности вшито сокрытие перетаскиваемых файлов до
         * момента дропа этих файлов. То есть dataTransfer.list.length = 0 всегда.
         * Из-за этого невозможно понять: файл является картинкой или видео в момент
         * перетаскивания до этапа дропа; ввиду чего дроп зона в сафари будет иметь
         * абстрактный формат: можно будет прикладывать как медиа и как файл для всего
         * и вне зависимости от типа файла. Подробнее: ME-45501.
         */
        if (browser.safari) {
            setDropAreaState({ type: 'mixed', asMedia: true });
        }
        if (!itemsArray.length) {
            return;
        }
        const imageType = areImages(itemsArray);
        const videoType = areVideos(itemsArray);
        const audioType = areAudios(itemsArray);
        /**
         * Если пользователь переносит и видео, и фото, то позволяем
         * добавить их как "медиа" (не как документы)
         */
        const previewable = arePreviewable(itemsArray);
        /**
         * Если пользователь переносит файлы вместе с какой-либо
         * директорией, то по-умолчанию предлагаем юзеру добавить
         * все как "медиа" (не как документы)
         */
        const itemsHaveDirectory = haveDirectory(itemsArray);
        const asMedia = imageType || videoType || previewable || itemsHaveDirectory;
        let type = 'doc';
        if (imageType) {
            type = 'image';
        }
        else if (videoType) {
            type = 'video';
        }
        else if (audioType) {
            type = 'audio';
        }
        else if (previewable || itemsHaveDirectory) {
            type = 'mixed';
        }
        setDropAreaState({ type, asMedia });
    }, []);
    return {
        dropAreaState,
        hideDropArea,
        handleDragEnter,
    };
};
//# sourceMappingURL=useDropAreaState.js.map