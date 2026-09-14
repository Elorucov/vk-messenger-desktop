import { useRef, useEffect, useState } from 'react';
import { useTimeout } from '../../hooks/useTimeout';
/**
 * добавляет возможность горизонтального перетаскивания (скролла)
 * реакций через нажатие и удержание левой кнопки мыши
 */
export const useHorizontalScroll = ({ onMoving }) => {
    const refScroll = useRef(null);
    const refContainer = useRef(null);
    const timeout = useTimeout();
    const _moving = useRef(false);
    const [moving, setMoving] = useState(_moving.current);
    useEffect(() => {
        let prevX = 0;
        function mousedown(e) {
            prevX = e.clientX;
            window.addEventListener('mousemove', mousemove);
            window.addEventListener('mouseup', mouseup);
            refContainer.current?.addEventListener('mouseleave', stopMotion);
        }
        function mousemove(e) {
            const diff = Math.floor(e.clientX - prevX);
            if (diff === 0) {
                return;
            }
            prevX = e.clientX;
            if (refScroll.current) {
                refScroll.current.scrollLeft -= diff;
            }
            if (!_moving.current) {
                timeout.clear();
                _moving.current = true;
                setMoving(true);
                onMoving(true);
            }
        }
        function mouseup() {
            stopMotion();
        }
        function stopMotion() {
            window.removeEventListener('mousemove', mousemove);
            window.removeEventListener('mouseup', mouseup);
            refContainer.current?.removeEventListener('mouseleave', stopMotion);
            timeout.add(() => {
                _moving.current = false;
                setMoving(false);
                onMoving(false);
            }, 16);
        }
        refScroll.current?.addEventListener('mousedown', mousedown);
        return () => {
            refScroll.current?.removeEventListener('mousedown', mousedown);
            window.removeEventListener('mousemove', mousemove);
            window.removeEventListener('mouseup', mouseup);
        };
    }, []);
    return { refScroll, refContainer, moving };
};
//# sourceMappingURL=useHorizontalScroll.js.map