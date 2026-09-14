import React, { memo, useRef, useEffect, } from 'react';
import { useInView } from 'react-intersection-observer';
import { useBrowserEnv } from '../../hooks/misc';
/**
 * Компонент, который выполняет покадровый рендеринг в `<canvas />`
 * проигрываемого с помощью `VideoMessagePlayer` видеосообщения для точной
 * передачи времени воспроизведения.
 */
export const AttachVideoMessageCanvas = memo(function AttachVideoMessageCanvas({ rootRef, status, className }) {
    const { videoMessagePlayer } = useBrowserEnv();
    const ref = useRef(null);
    const ctxRef = useRef(null);
    const playerRef = useRef(videoMessagePlayer.getPlayer());
    const size = useRef(0);
    // Приостанавливаем отрисовку видео в `<canvas />`, если `<canvas />`
    // находится за пределами видимого пространства.
    const { ref: inViewRef, inView } = useInView({
        skip: status === 'stopped' || status === 'ended',
    });
    useEffect(() => {
        if (!inView || (status !== 'playing' && status !== 'paused')) {
            return;
        }
        let req = null;
        const tick = () => {
            if (!ctxRef.current || !playerRef.current) {
                return;
            }
            ctxRef.current.drawImage(playerRef.current, 0, 0, size.current, size.current);
            if (status === 'playing') {
                req = window.requestAnimationFrame(tick);
            }
        };
        req = window.requestAnimationFrame(tick);
        return () => {
            if (req) {
                window.cancelAnimationFrame(req);
            }
        };
    }, [inView, status]);
    // Следим за контейнером из данного компонента, чтобы не выносить эту
    // логику на уровень выше и не вызывать лишние ререндеры.
    useEffect(() => inViewRef(rootRef.current), [inViewRef, rootRef]);
    // Следим за изменениями размера, чтобы правильно отрисовывать
    // видеосообщение в `<canvas />`.
    useEffect(() => {
        if (!rootRef.current || !window.ResizeObserver) {
            return;
        }
        const resizeObserver = new ResizeObserver(([entry]) => {
            if (!entry || !ref.current) {
                return;
            }
            const { target } = entry;
            const rect = target.getBoundingClientRect();
            const pixelRatio = window.devicePixelRatio || 1;
            size.current =
                Math.round(pixelRatio * rect.right) -
                    Math.round(pixelRatio * rect.left);
            window.requestAnimationFrame(() => {
                if (!ref.current) {
                    return;
                }
                ref.current.width = ref.current.height = size.current;
            });
        });
        resizeObserver.observe(rootRef.current);
        return () => resizeObserver.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (React.createElement("canvas", { className: className, ref: (element) => {
            if (!element) {
                return;
            }
            ref.current = element;
            ctxRef.current = element.getContext('2d');
        } }));
});
//# sourceMappingURL=AttachVideoMessageCanvas.js.map