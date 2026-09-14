import '../../ui/RightPanel/RightPanelContainer.css';
import React, { useLayoutEffect, useRef } from 'react';
import cx from 'classnames';
import { nanoid } from 'nanoid';
import { useRightPanelContext } from '../../ui/RightPanel/RightPanelContext';
const DEFAULT_MIN_COMPRESSED_WIDTH = 400;
/**
 * Компонент визуального контейнера правой панели, оборачивает контент, который надо будет сжимать.
 * Умеет сжимать контент и определять, нужно ли сжимать, в зависимости от его ширины и ширины
 * видимой панели.
 * Важно, чтобы открытая правая панель визуально вписывалась в оборачиваемый контент по правой стороне,
 * так как ужимаем контент на ее ширину.
 */
export const RightPanelContainer = ({ children, className, minCompressedWidth = DEFAULT_MIN_COMPRESSED_WIDTH, }) => {
    const id = useRef(nanoid());
    const context = useRightPanelContext();
    const { setCompressedElementId, compressedElementId, activePanelWidth } = context;
    const contextRef = useRef(context);
    contextRef.current = context;
    const ref = useRef(null);
    useLayoutEffect(() => {
        const shouldCompress = activePanelWidth !== null
            ? (ref.current?.clientWidth ?? 0) - activePanelWidth >=
                minCompressedWidth
            : false;
        if (!shouldCompress) {
            // Для кейса одновременного отображения на странице нескольких
            // RightPanelContainer важно, чтоб менять значение мог только текущий сжатый компонент.
            if (compressedElementId === id.current) {
                setCompressedElementId(null);
            }
            return;
        }
        // Избегаем потенциального зацикливания для кейса одновременного отображения
        // на странице нескольких RightPanelContainer.
        if (compressedElementId === null) {
            setCompressedElementId(id.current);
        }
    }, [
        activePanelWidth,
        minCompressedWidth,
        compressedElementId,
        setCompressedElementId,
    ]);
    useLayoutEffect(() => () => {
        // Для актуальности используем реф на контекст, так как он
        // также как стейт и пропсы берется из замыкания в эффекте.
        if (contextRef.current.compressedElementId === id.current) {
            contextRef.current.setCompressedElementId(null);
        }
    }, []);
    return (React.createElement("div", { className: cx('RightPanelContainer', className), ref: ref, style: {
            '--compress_width': `${activePanelWidth ?? 0}px`,
        } },
        React.createElement("div", { className: cx('RightPanelContainer__mainContent', {
                'RightPanelContainer__mainContent--compressed': compressedElementId === id.current,
            }) }, children)));
};
//# sourceMappingURL=RightPanelContainer.js.map