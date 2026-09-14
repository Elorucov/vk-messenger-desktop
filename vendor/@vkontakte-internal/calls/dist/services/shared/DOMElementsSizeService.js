import { __decorate, __metadata } from "tslib";
import { makeAutoObservable, runInAction } from 'mobx';
import { scope } from '@vkontakte-internal/di';
import { debounce } from '@vkontakte/vkjs';
import { ECallViewMode } from '@vkontakte-internal/calls-core';
import { ID_CALLS_PARTICIPANTS_BOX } from '../../constants';
import { createResizeObserver } from '../../hooks/useResizeObserver';
import { useEffect } from 'react';
const INITIAL_DIMENSIONS = { gridNew: [0, 0], window: [0, 0] };
/**
 * хелпер используется для вычисления размера окна браузера и
 * размера элемента, который содержит участников в режиме "грида"
 */
let DOMElementsSizeService = class DOMElementsSizeService {
    constructor() {
        this._cache = INITIAL_DIMENSIONS;
        this._dimensions = this._cache;
        this._update = debounce(() => {
            runInAction(() => {
                this._dimensions = { ...this._cache };
            });
        }, 200);
        this.update = (next) => {
            runInAction(() => {
                this._cache = { ...this._cache, ...next };
            });
            this._update();
        };
        makeAutoObservable(this);
    }
    clear() {
        this._update.cancel?.();
        this._cache = INITIAL_DIMENSIONS;
        this._dimensions = INITIAL_DIMENSIONS;
    }
    get dimensions() {
        return {
            ww: this._dimensions.window[0],
            wh: this._dimensions.window[1],
            gw: this._dimensions.gridNew[0],
            gh: this._dimensions.gridNew[1],
        };
    }
};
DOMElementsSizeService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [])
], DOMElementsSizeService);
export { DOMElementsSizeService };
/**
 * хелпер используется для вычисления размера окна браузера и
 * размера элемента, который содержит участников в режиме "грида"
 */
export const useDOMElementsSize = ({ viewMode, update, clear }) => {
    // тут смотрим за размером окна
    useEffect(() => {
        const onResize = () => {
            update({ window: [window.innerWidth, window.innerHeight] });
        };
        onResize();
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
            clear();
        };
    }, []);
    // тут смотрим за размером блока с "гридом" участников
    useEffect(() => {
        if (viewMode !== ECallViewMode.Grid) {
            return;
        }
        const gridContainter = document.getElementById(ID_CALLS_PARTICIPANTS_BOX);
        if (!gridContainter) {
            return;
        }
        const onResize = (entry) => {
            const { width, height } = entry.contentRect;
            if (width && height) {
                update({ gridNew: [Math.round(width) - 48, Math.round(height)] });
            }
        };
        const observer = createResizeObserver(onResize);
        observer.observe(gridContainter);
        return () => {
            observer.disconnect();
        };
    }, [viewMode]);
};
//# sourceMappingURL=DOMElementsSizeService.js.map