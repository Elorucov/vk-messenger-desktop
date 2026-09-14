import { useEffect } from 'react';
/**
 * хук для подключения скролла до выбранного элемемента
 * селекта таймзон
 *
 * вся эта движуха, чтобы не трогать оригинальный Select в палитре
 */
export const useSelectTimezonesScrollOnOpen = ({ selector }) => {
    useEffect(() => {
        if (!window.hasOwnProperty('MutationObserver')) {
            return;
        }
        const $target = document.querySelector(`.${selector}`);
        const $input = document.querySelector(`.${selector} input`);
        if (!$target || !$input) {
            return;
        }
        const callback = (mutationList) => {
            for (const mutation of mutationList) {
                if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        if (!(node instanceof HTMLElement) || !node.classList.contains('CallsSelect__menu')) {
                            continue;
                        }
                        const $selected = node.querySelector('.CallsSelect__option--selected');
                        if (!$selected) {
                            continue;
                        }
                        const elRect = $target.getBoundingClientRect();
                        const seletedRect = $selected.getBoundingClientRect();
                        let top = seletedRect.top - elRect.top - elRect.height;
                        requestAnimationFrame(() => {
                            node.scrollTo({ top });
                        });
                    }
                }
                else if (mutation.type === 'attributes') {
                    if (!(mutation.target instanceof HTMLInputElement)) {
                        continue;
                    }
                    $target.querySelector('.CallsSelect__menu')?.scrollTo({ top: 0 });
                }
            }
        };
        const observer = new MutationObserver(callback);
        observer.observe($target, { childList: true });
        observer.observe($input, { attributes: true });
        return () => {
            observer.disconnect();
        };
    }, [selector]);
};
//# sourceMappingURL=useSelectTimezonesScrollOnOpen.js.map