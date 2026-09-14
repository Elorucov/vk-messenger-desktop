import React, { useEffect, useState } from 'react';
import { useBrowserEnv } from '../../hooks/misc';
import { StickerManager } from '../../env/StickerManager';
/**
 * Компонент, который отрисовывает стикеры и сердечки в live трансляции
 */
export const StickerCanvas = () => {
    const { videoStickers } = useBrowserEnv();
    const [stickerManager, setManager] = useState(null);
    useEffect(() => {
        const manager = new StickerManager();
        setManager(manager);
        return () => {
            manager.destroy();
        };
    }, []);
    useEffect(() => {
        const unsubscribe = videoStickers?.subscribe((sticker) => {
            if (stickerManager?.canvas) {
                stickerManager.add(sticker);
            }
        });
        return () => unsubscribe?.();
    }, [videoStickers, stickerManager]);
    return (stickerManager && (React.createElement("canvas", { className: "StickerCanvas", width: 100, height: 320, ref: stickerManager.init })));
};
//# sourceMappingURL=StickerCanvas.js.map