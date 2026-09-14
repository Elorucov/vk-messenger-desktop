import '../../ui/DropArea/DropArea.css';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, } from 'react';
import { Portal } from '../../ui/Portal/Portal';
import { DropTarget } from '../../ui/DropTarget/DropTarget';
import cx from 'classnames';
import { getFilesFromDataTransferItems } from '../../utils/files';
import { usePrevious } from '../../hooks/misc';
import { isImage } from '../../../data/env/Uploader';
import { browser } from '../../utils/misc';
export const DropAreaContext = createContext({
    containerRef: {},
    onHide: () => { },
});
export const DropArea = ({ onFilesAdd, disabled, }) => {
    const { asMedia, type, onHide, containerRef } = useContext(DropAreaContext);
    const isPreviouslyDisabled = usePrevious(disabled);
    /**
     * Эти и другие хаки применяются исключительно для самого лучшего в мире
     * браузера - Safari, который не умеет (а во что он вообще умеет?) в relatedTarget
     *
     * См: https://bugs.webkit.org/show_bug.cgi?id=66547
     */
    const [, setEnterCount] = useState(0);
    const [isOver, setIsOver] = useState(false);
    useEffect(() => {
        /**
         * При смене значения disabled с true на false у нас может оставаться
         * сохраненное состояние о перетаскиваемом файле.
         * onHide() сбрасывает состояние, чтобы DropTarget внезапно не появился
         */
        if (isPreviouslyDisabled && !disabled) {
            onHide();
        }
    }, [isPreviouslyDisabled, disabled, onHide]);
    const onDragOver = useCallback((e) => {
        e.preventDefault();
    }, []);
    const onDragLeave = useCallback((e) => {
        e.stopPropagation();
        /**
         * В Safari relatedTarget всегда null (коммент со ссылкой-пруфом выше).
         *
         * Ввиду чего императивно считаем заходы и выходы из зоны, чтобы
         * вовремя скрывать.
         */
        if (browser.safari) {
            setEnterCount((prev) => {
                const newCount = --prev;
                if (isOver && newCount === 0) {
                    setIsOver(false);
                    onHide();
                }
                return newCount;
            });
            return;
        }
        const { relatedTarget: toTarget } = e;
        if (!(toTarget instanceof HTMLElement) ||
            !toTarget?.matches('.DropTarget, .DropArea')) {
            onHide();
        }
    }, [isOver, onHide]);
    const handleAddFiles = useCallback((asFiles = false) => async (e) => {
        e.preventDefault();
        const { dataTransfer: { files, items }, } = e;
        let filesToAdd = [];
        if (files && files.length > 0 && (!items || !items.length)) {
            filesToAdd = [...filesToAdd, ...Array.from(files)];
        }
        else if (items && items.length > 0) {
            const folderFiles = await getFilesFromDataTransferItems(items);
            if (folderFiles.length) {
                filesToAdd = [...filesToAdd, ...folderFiles];
            }
        }
        const restFiles = asFiles ? filesToAdd : [];
        /**
         *  Если загружаем фотографии не как файлы, то проверяем
         *  размер каждой фотографии, которую можно загрузить как фото.
         *
         *  Максимально-возможный размер загружаемого фото - 25 мб.
         *  Все, что размером больше - должно загружаться как файл.
         *  Форсим это поведение, чтобы не показывать ошибку после загрузки
         *  (Бек ничего не возвращает, если размер фото больше 25 мб)
         */
        if (!asFiles) {
            const imagesAsFiles = [];
            for (const file of filesToAdd) {
                if (isBigImage(file)) {
                    imagesAsFiles.push(file);
                }
                else {
                    restFiles.push(file);
                }
            }
            if (imagesAsFiles.length) {
                onFilesAdd(imagesAsFiles, { asFiles: true });
            }
        }
        if (restFiles.length) {
            onFilesAdd(restFiles, { asFiles });
        }
        onHide();
    }, [onFilesAdd, onHide]);
    const isVisible = !disabled && type;
    return (React.createElement(Portal, { portalTarget: containerRef.current },
        React.createElement("div", { className: cx('DropArea', {
                'DropArea--hidden': !isVisible,
            }), onDragStart: () => {
                setEnterCount(0);
                setIsOver(true);
            }, onDragEnter: () => {
                setIsOver(true);
                setEnterCount((prev) => ++prev);
            }, onDragOver: onDragOver, onDragLeave: onDragLeave, onDrop: () => {
                onHide();
                setIsOver(false);
                setEnterCount(0);
            } }, isVisible && (React.createElement(React.Fragment, null,
            React.createElement(DropTarget, { onDrop: handleAddFiles(true), type: type }),
            asMedia && (React.createElement(DropTarget, { onDrop: handleAddFiles(false), type: type, isCompressed: true })))))));
};
export const DropAreaProvider = ({ children, type, asMedia, onHide, containerRef }) => {
    const value = useMemo(() => ({
        type,
        asMedia,
        onHide,
        containerRef,
    }), [type, asMedia, onHide, containerRef]);
    return (React.createElement(DropAreaContext.Provider, { value: value }, children));
};
function isBigImage(file) {
    if (!isImage(file)) {
        return false;
    }
    const MAX_IMAGE_SIZE = 25 * 1024 ** 2; // 25 мб
    return file.size >= MAX_IMAGE_SIZE;
}
//# sourceMappingURL=DropArea.js.map