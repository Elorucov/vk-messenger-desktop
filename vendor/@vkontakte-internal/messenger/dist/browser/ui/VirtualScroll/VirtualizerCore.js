import { browser, getOffsetRect } from '../../utils/misc';
import { scrollToElement } from '../../utils/scroll';
import { clamp, exhaustivenessCheck, isDeepEqual, isDev, throttle, } from '../../../core/utils/misc';
export class VirtualizerCore {
    /**
     * Конфиг виртуалайзера
     */
    config;
    /**
     * DOM элемент контейнера контента списка
     */
    wrapper;
    /**
     * DOM элемент контента списка
     */
    content;
    /**
     * Внешние пропы виртуалайзера
     */
    externalProps;
    /**
     * Инстанс IntersectionObserver
     */
    intersectionObserver;
    /**
     * Инстанс ResizeObserver
     */
    resizeObserver;
    /**
     * Буфер элементов, которые изменили свой статус isIntersecting
     */
    intersectionBuffer = new Map();
    /**
     * Зарегистрированные виртуальные элементы
     */
    virtualItems = new Map();
    /**
     * Элемент, вокруг которого считается sliceArea
     */
    sliceItem;
    /**
     * Форсированный элемент-якорь, по которому определяем сохраняемое
     * положение скролла.
     * По дефолту сохраняемое положение скролла определяется по sliceItem,
     * но добавили это поле для фикса краевого кейса из бага:
     * https://jira.mvk.com/browse/ME-78276
     */
    forcedAnchorItemKey;
    /**
     * Область элементов, которые должны быть в DOM
     */
    sliceArea = undefined;
    /**
     * Область элементов, которые сейчас видимы
     */
    viewArea = undefined;
    /**
     * Корректирование позиции скрола после ререндера списка
     */
    scrollReposition;
    /**
     * Таймаут оповещения об изменении `viewArea`
     */
    onViewAreaChangeTimeout;
    /**
     * Признак запиненности к низу списка
     */
    pinBottom;
    /**
     * Следующее значение pinBottom для выставления значения с задержкой.
     */
    nextPinBottom = undefined;
    /**
     * Граница слайса, измененная при последней обработке видимых элементов,
     * через нее мы можем определить, что нужно увеличить количество элементов
     * в слайсе.
     */
    prevBumpedBorder;
    /**
     * Количество элементов в слайсе
     */
    sliceCount;
    /**
     * Иногда safari скроллит не к установленному scrollTop,
     * поэтому мы вынуждены доскралливать до установленного
     * значения в обработчике скролла.
     * См. вторую проблему из описания https://jira.mvk.com/browse/ME-54333
     */
    wrapperForcedScrollTop;
    constructor(config) {
        this.logger.debug('Create new VirtualizerCore');
        this.config = config;
        this.sliceCount = Math.round(config.sliceCount);
        this.handleIntersectionBuffer = throttle(this.handleIntersectionBuffer, this.config.throttleDelay, this.config.trailingThrottleDelay);
    }
    updateConfig = (config) => {
        this.config = config;
    };
    onPinBottomChanged = (pinBottom) => {
        this.logger.debug('onPinBottomChanged: ', pinBottom, 'current timeout: ', this.nextPinBottom?.timeoutId);
        if (this.nextPinBottom?.timeoutId) {
            window.clearTimeout(this.nextPinBottom.timeoutId);
        }
        this.nextPinBottom = { value: pinBottom };
        /**
         * Обновляем this.pinBottom с таймаутом, чтобы при ресайзе this.wrapper
         * одновременно с открытием внизу списка, не зависеть от race condition между
         * вызовами коллбэков resizeObserver и intersectionObserver (который,
         * как правило, используется для вызова onPinBottomChanged в компонентах)
         */
        this.nextPinBottom.timeoutId = window.setTimeout(() => {
            this.logger.debug('onPinBottomChanged timeout: ', this.nextPinBottom);
            this.pinBottom = this.nextPinBottom?.value;
            /**
             * Обновляем sliceItem при изменении pinBottom, так как он зависит от pinBottom.
             */
            const newSliceItem = this.viewArea && this.getSliceItemKey(this.viewArea);
            if (newSliceItem) {
                this.updateSliceItem(newSliceItem);
            }
        }, 0);
    };
    getSliceArea = () => this.sliceArea;
    getSliceItem = () => {
        if (!this.sliceItem || !this.content || !this.wrapper) {
            return;
        }
        return this.getScrollOptions(this.sliceItem.key);
    };
    /**
     * Старт виртуалайзера
     */
    createObservers = (wrapper, content) => {
        const unobserve = () => {
            this.intersectionObserver?.disconnect();
            this.intersectionObserver = undefined;
            this.resizeObserver?.disconnect();
            this.resizeObserver = undefined;
            this.content = undefined;
            this.wrapper = undefined;
        };
        if (this.intersectionObserver || this.resizeObserver) {
            if (isDev) {
                throw new Error('Попытка создать новый observer раньше удаления старого');
            }
            return unobserve;
        }
        this.wrapper = wrapper;
        this.content = content;
        const handleScroll = () => {
            if (this.wrapperForcedScrollTop === undefined ||
                this.wrapper === undefined ||
                !this.externalProps) {
                return;
            }
            const forcedScrollTop = this.wrapperForcedScrollTop;
            this.wrapperForcedScrollTop = undefined;
            const { vkm_virt_scroll_block_config } = this.externalProps.featureFlags;
            const isDiffInTreshold = Math.abs(this.wrapper.scrollTop - forcedScrollTop) <=
                (vkm_virt_scroll_block_config?.threshold ?? 1);
            if (isDiffInTreshold) {
                return;
            }
            this.logger.error('scroll to wrapperForcedScrollTop', this.wrapper.scrollTop, forcedScrollTop);
            const shouldBlockMomentumScroll = (() => {
                if (vkm_virt_scroll_block_config?.mobileOnly) {
                    return browser.mobile;
                }
                if (vkm_virt_scroll_block_config?.iosSafariOnly) {
                    return browser.safari_mobile;
                }
                return !!vkm_virt_scroll_block_config && browser.safari;
            })();
            if (shouldBlockMomentumScroll) {
                const prevOverflowValue = window.getComputedStyle(this.wrapper).overflow;
                this.wrapper.style.overflow = 'hidden';
                this.wrapper.scrollTop = forcedScrollTop;
                this.wrapper.style.overflow = prevOverflowValue || 'unset';
                return;
            }
            // Для других браузеров это ломает корректную работу скролла
            if (browser.safari) {
                this.wrapper.scrollTop = forcedScrollTop;
            }
        };
        this.wrapper.addEventListener('scroll', handleScroll, { passive: true });
        const handleEntries = (entries) => {
            entries.forEach((entry) => {
                this.intersectionBuffer.set(entry.target, entry);
            });
            this.handleIntersectionBuffer();
        };
        this.intersectionObserver = new IntersectionObserver(handleEntries, {
            root: this.wrapper,
        });
        if (this.virtualItems.size > 0) {
            ;
            [...this.virtualItems.values()].forEach(({ element }) => this.intersectionObserver?.observe(element));
        }
        const handleResize = () => {
            this.logger.error('handleResize: ', this.pinBottom);
            if (this.pinBottom) {
                this.scheduleScroll({
                    kind: 'Bottom',
                });
                // Ресайз дергается уже после обновления макета, поэтому можем сделать вызов afterUpdate тут.
                this.afterLayoutUpdate();
            }
        };
        this.resizeObserver = new ResizeObserver(handleResize);
        this.resizeObserver.observe(this.wrapper);
        this.logger.debug('Created observer', this.intersectionObserver);
        return () => {
            unobserve();
            this.handleIntersectionBuffer.cancel?.();
            this.wrapper?.removeEventListener('scroll', handleScroll);
        };
    };
    /**
     * Обновление актуальных внешних пропов виртуалайзера
     */
    updateExternalProps = (externalProps) => {
        this.logger.debug('Update external props', this.externalProps, externalProps);
        if (externalProps.itemsKeys.length === 0) {
            this.logger.debug('Update external props with 0 items');
            return this.reset();
        }
        const scrollPositionChanged = !this.externalProps ||
            this.externalProps.scrollPosition !== externalProps.scrollPosition;
        let listContentChanged = false;
        let itemsChanged = false;
        if (this.externalProps) {
            // Проверяем, что изменилось кол-во элементов или порядок уникальных ключей элементов
            itemsChanged = this.externalProps.itemsKeys !== externalProps.itemsKeys;
            listContentChanged =
                itemsChanged ||
                    this.externalProps.contentUpdatesCount !==
                        externalProps.contentUpdatesCount;
        }
        this.externalProps = externalProps;
        this.logger.debug('Update external props changed options', scrollPositionChanged, listContentChanged);
        switch (true) {
            case scrollPositionChanged: {
                const { scrollPosition } = this.externalProps;
                let sliceItemKey;
                if (scrollPosition.kind === 'Upper') {
                    sliceItemKey = this.getItemKey(0);
                }
                else if (scrollPosition.kind === 'Bottom') {
                    sliceItemKey = this.getItemKey(this.externalProps.itemsKeys.length - 1);
                }
                else {
                    sliceItemKey = scrollPosition.options.itemKey;
                }
                this.updateSliceArea({ key: sliceItemKey, align: 'center' });
                this.scheduleScroll(scrollPosition);
                break;
            }
            case listContentChanged: {
                this.updateSliceArea(this.sliceItem, false);
                if (this.scrollReposition === undefined) {
                    if (this.getAnchorAlign() === 'scrollTop' && itemsChanged) {
                        this.scheduleScroll({ kind: 'ScrollTop' });
                        break;
                    }
                    if (!this.sliceItem) {
                        break;
                    }
                    const itemKey = this.externalProps.featureFlags
                        .vkm_virt_scroll_slice_anchor
                        ? this.forcedAnchorItemKey ?? this.sliceItem.key
                        : this.sliceItem.key;
                    this.scheduleScroll({
                        kind: 'Anchor',
                        itemKey,
                    });
                }
                break;
            }
            default:
                break;
        }
        this.forcedAnchorItemKey = undefined;
    };
    /**
     * Метод, который вызыавется после каждого ререндера списка
     */
    afterLayoutUpdate = () => {
        if (!this.scrollReposition ||
            !this.wrapper ||
            !this.content ||
            !this.externalProps) {
            return;
        }
        const prevWrapperSrollTop = this.wrapper.scrollTop;
        let newScrollTop = prevWrapperSrollTop;
        const { vkm_virt_scroll_block_config } = this.externalProps.featureFlags;
        /**
         * Фикс загрузки на мобилках в сафари на десктопе: https://jira.mvk.com/browse/ME-46344 .
         * См. https://lovemewithoutall.github.io/it/setting-scrollTop-on-momentum-scroll/.
         */
        const shouldBlockMomentumScroll = this.scrollReposition.kind === 'Anchor' && !vkm_virt_scroll_block_config;
        let prevOverflowValue = '';
        if (shouldBlockMomentumScroll) {
            prevOverflowValue = window.getComputedStyle(this.wrapper).overflow;
            this.wrapper.style.overflow = 'hidden';
        }
        switch (this.scrollReposition.kind) {
            case 'Item':
            case 'Anchor': {
                const itemEl = this.getVirtualItemElement(this.scrollReposition.options.itemKey);
                if (!itemEl) {
                    this.logger.error('no element to scroll: ', this.scrollReposition);
                    this.scrollReposition = undefined;
                    break;
                }
                const { align, margin } = this.scrollReposition.options;
                newScrollTop = scrollToElement(this.wrapper, this.content, itemEl, align, margin);
                this.scrollReposition = undefined;
                break;
            }
            case 'Upper': {
                newScrollTop = 0;
                this.wrapper.scrollTop = newScrollTop;
                this.scrollReposition = undefined;
                break;
            }
            case 'Bottom': {
                const { scrollHeight, clientHeight } = this.wrapper;
                newScrollTop = scrollHeight - clientHeight;
                this.wrapper.scrollTop = newScrollTop;
                this.scrollReposition = undefined;
                break;
            }
            case 'ScrollTop': {
                newScrollTop = this.scrollReposition.value;
                this.wrapper.scrollTop = newScrollTop;
                this.scrollReposition = undefined;
                break;
            }
            default:
                exhaustivenessCheck(this.scrollReposition);
        }
        if (shouldBlockMomentumScroll) {
            this.wrapper.style.overflow = prevOverflowValue || 'unset';
        }
        this.logger.debug('scroll in layout effect to: ', newScrollTop, ' prev: ', prevWrapperSrollTop);
        /**
         * Запоминаем обновленную позицию скролла.
         */
        if (Math.abs(prevWrapperSrollTop - newScrollTop) >= 1 ||
            vkm_virt_scroll_block_config) {
            this.wrapperForcedScrollTop = newScrollTop;
        }
        /**
         * Обновляем pinBottom, так как могли его ранее сбросить
         * в scheduleScroll, чтобы в случае ресайза это не мешало
         * скроллиться к указанной в scheduleScroll позиции.
         */
        this.onPinBottomChanged(this.nextPinBottom?.value);
    };
    /**
     * Регистрация нового виртуального элемента
     */
    registerVirtualItem = (itemElement, callback) => {
        const itemKey = this.getVirtualItemKey(itemElement);
        if (this.virtualItems.has(itemKey)) {
            throw new Error('Can not register virtual item, already have this item');
        }
        this.virtualItems.set(itemKey, {
            key: itemKey,
            isIntersecting: false,
            callback,
            element: itemElement,
        });
        this.intersectionObserver?.observe(itemElement);
        // this.logger.debug('Register virtual item', itemKey)
        return () => {
            this.intersectionObserver?.unobserve(itemElement);
            this.virtualItems.delete(itemKey);
            const viewArea = this.findViewArea();
            this.updateViewArea(viewArea);
            // this.logger.debug('Unregister virtual item', itemKey)
        };
    };
    /**
     * Поиск индекса элемента по его ключу
     */
    findVirtualItemIndex = (itemKey) => {
        if (!this.externalProps) {
            return -1;
        }
        return this.externalProps.itemsKeys.findIndex((key) => key === itemKey);
    };
    /**
     * Остановка обзервера и сброс всех параметров
     */
    destroy = () => {
        this.logger.debug('Destroy virtualizer');
        this.intersectionObserver?.disconnect();
        this.intersectionObserver = undefined;
        this.resizeObserver?.disconnect();
        this.resizeObserver = undefined;
        this.content = undefined;
        this.wrapper = undefined;
        this.reset();
    };
    /**
     * Сброс всех параметров
     */
    reset = () => {
        this.logger.debug('Reset virtualizer');
        this.externalProps = undefined;
        this.sliceArea = undefined;
        this.viewArea = undefined;
        this.intersectionBuffer.clear();
        this.virtualItems.clear();
        if (this.onViewAreaChangeTimeout) {
            window.clearTimeout(this.onViewAreaChangeTimeout);
        }
        this.prevBumpedBorder = undefined;
        this.pinBottom = undefined;
        this.nextPinBottom = undefined;
        this.wrapperForcedScrollTop = undefined;
        this.forcedAnchorItemKey = undefined;
    };
    getSliceItemKey(viewArea) {
        if (!this.externalProps) {
            this.logger.error('No externalProps in getSliceItemKey', viewArea);
            return;
        }
        const align = this.getAnchorAlign();
        let sliceItemIndex;
        switch (align) {
            case 'bottom':
                sliceItemIndex = viewArea.bottomIndex;
                break;
            case 'scrollTop':
            case 'upper':
                sliceItemIndex = viewArea.upperIndex;
                break;
            case 'center':
                sliceItemIndex = Math.ceil((viewArea.upperIndex + viewArea.bottomIndex) / 2);
                break;
            default:
                exhaustivenessCheck(align);
        }
        return {
            key: this.getItemKey(sliceItemIndex),
            align,
        };
    }
    /**
     * Обработка буффера виртуальных элементов
     */
    handleIntersectionBuffer = () => {
        if (!this.externalProps || !this.sliceItem) {
            return;
        }
        const entries = Array.from(this.intersectionBuffer.values());
        entries.forEach((entry) => {
            const itemKey = this.getVirtualItemKey(entry.target);
            const virtualItem = this.virtualItems.get(itemKey);
            if (virtualItem) {
                // this.logger.debug(
                //   'Proccess item',
                //   itemKey,
                //   virtualItem,
                //   entry.isIntersecting,
                // )
                virtualItem.isIntersecting = entry.isIntersecting;
                virtualItem.callback(entry);
            }
        });
        this.intersectionBuffer.clear();
        const nextViewArea = this.findViewArea();
        this.updateViewArea(nextViewArea);
        if (!nextViewArea) {
            return;
        }
        const bumpedUpperBorder = this.sliceArea &&
            nextViewArea.upperIndex - this.sliceArea.upperIndex <=
                this.config.preloadCount &&
            // Условие дублирует проверку внутри updateSliceArea, но оно важно, чтобы не
            // вызывать updateSliceCount без надобности.
            this.sliceArea.upperIndex > 0;
        const bumpedBottomBorder = this.sliceArea &&
            this.sliceArea.bottomIndex - nextViewArea.bottomIndex <=
                this.config.preloadCount &&
            // Условие дублирует проверку внутри updateSliceArea, но оно важно, чтобы не
            // вызывать updateSliceCount без надобности.
            this.sliceArea.bottomIndex < this.externalProps.itemsKeys.length - 1;
        const viewAreaItemsCount = nextViewArea.bottomIndex - nextViewArea.upperIndex + 1;
        // Создаем запас элементов, чтобы не триггерить переключение слайса слишком часто.
        const notEnoughItemsСount = viewAreaItemsCount * this.config.sliceByViewAreaRatio - this.sliceCount;
        const newSliceItem = this.getSliceItemKey(nextViewArea);
        this.logger.debug('Handle intersection', nextViewArea, bumpedUpperBorder, bumpedBottomBorder, notEnoughItemsСount, newSliceItem);
        let isSliceAreaUpdated = false;
        const updateSliceArea = () => {
            const prevSliceArea = this.sliceArea;
            if (this.externalProps && this.updateSliceArea(newSliceItem)) {
                isSliceAreaUpdated = true;
                this.forcedAnchorItemKey = (() => {
                    if (!this.sliceItem || !prevSliceArea) {
                        return undefined;
                    }
                    const index = Math.max(Math.min(this.sliceItem.index, prevSliceArea.bottomIndex), prevSliceArea.upperIndex);
                    return this.getItemKey(index);
                })();
                this.logger.debug('scheduleScroll on updateSliceArea');
                this.externalProps.triggerContentUpdate();
            }
        };
        const updateSliceCount = (notEnoughItemsСount = this.config.sliceCountIncrement) => {
            this.logger.debug('Bump Not enough items to display', bumpedUpperBorder, bumpedBottomBorder, this.prevBumpedBorder);
            this.sliceCount += Math.round(Math.ceil(notEnoughItemsСount / this.config.sliceCountIncrement) *
                this.config.sliceCountIncrement);
        };
        switch (true) {
            case notEnoughItemsСount > 0: {
                this.prevBumpedBorder = undefined;
                updateSliceCount(notEnoughItemsСount);
                updateSliceArea();
                break;
            }
            case bumpedUpperBorder: {
                this.logger.debug('Bump upper border');
                /**
                 * Если на предыдущем вызове перемещали слайс вниз, а сейчас понадобилось двигать слайс вверх,
                 * то это признак того, что нам не хватает данных для отображения и нужно увеличивать слайс.
                 */
                if (this.prevBumpedBorder === 'bottom') {
                    updateSliceCount();
                }
                updateSliceArea();
                this.prevBumpedBorder = 'upper';
                break;
            }
            case bumpedBottomBorder: {
                this.logger.debug('Bump bottom border');
                /**
                 * Если на предыдущем вызове перемещали слайс вверх, а сейчас понадобилось двигать слайс вниз,
                 * то это признак того, что нам не хватает данных для отображения и нужно увеличивать слайс.
                 */
                if (this.prevBumpedBorder === 'upper') {
                    updateSliceCount();
                }
                updateSliceArea();
                this.prevBumpedBorder = 'bottom';
                break;
            }
            default: {
                this.prevBumpedBorder = undefined;
                // Актуализируем sliceItem, чтобы он был в видимой области контента.
                if (newSliceItem) {
                    this.updateSliceItem(newSliceItem);
                }
            }
        }
        if (isSliceAreaUpdated) {
            // Повторно вызываем для того, чтобы увеличить слайс еще раз,
            // если в нем все еще недостаточно элементов.
            this.handleIntersectionBuffer();
        }
    };
    /**
     * Запланировать отскрол списка на следующий вызов `afterUpdate`
     */
    scheduleScroll(scrollSchedule) {
        if (!this.externalProps) {
            if (isDev) {
                throw new Error('VList: sliceItem of externalProps are not defined inside scheduleScroll');
            }
            return;
        }
        this.logger.debug('Schedule scroll', scrollSchedule, this.scrollReposition);
        switch (scrollSchedule.kind) {
            case 'Item': {
                /**
                 * Блокируем запинненость к низу, чтобы не мешать истории скроллиться
                 * См. ME-46777
                 */
                this.forcedSetPinBottom(undefined);
                this.scrollReposition = scrollSchedule;
                break;
            }
            case 'Anchor': {
                const options = this.getScrollOptions(scrollSchedule.itemKey);
                if (!options) {
                    break;
                }
                /**
                 * Блокируем запинненость к низу, чтобы не мешать истории скроллиться
                 * См. ME-46777
                 */
                this.forcedSetPinBottom(undefined);
                this.scrollReposition = {
                    kind: 'Anchor',
                    options,
                };
                break;
            }
            case 'Upper': {
                this.forcedSetPinBottom(undefined);
                this.scrollReposition = {
                    kind: 'Upper',
                };
                break;
            }
            case 'Bottom': {
                this.forcedSetPinBottom(true);
                this.scrollReposition = {
                    kind: 'Bottom',
                };
                break;
            }
            case 'ScrollTop': {
                if (!this.wrapper) {
                    break;
                }
                this.forcedSetPinBottom(undefined);
                this.scrollReposition = {
                    kind: 'ScrollTop',
                    value: this.wrapper.scrollTop,
                };
                break;
            }
            default:
                exhaustivenessCheck(scrollSchedule);
        }
    }
    updateSliceItem = (sliceItem) => {
        if (!this.externalProps) {
            return;
        }
        let sliceKey = sliceItem.key;
        let itemIndex = this.findVirtualItemIndex(sliceKey);
        this.logger.debug('Update slice item', sliceItem, itemIndex);
        if (itemIndex === -1) {
            itemIndex = clamp(this.sliceItem?.index || 0, 0, this.externalProps.itemsKeys.length - 1);
            sliceKey = this.getItemKey(itemIndex);
            this.logger.debug('Found true slice item', sliceKey, itemIndex);
        }
        this.sliceItem = {
            key: sliceKey,
            index: itemIndex,
            align: sliceItem.align,
        };
    };
    /**
     * Обновление `sliceItem` и рассчет нового значения `sliceArea`
     */
    updateSliceArea = (newSliceItem, isForced = true) => {
        const prevSliceItem = this.sliceItem;
        if (!this.externalProps || !newSliceItem) {
            return false;
        }
        this.updateSliceItem(newSliceItem);
        const shouldUpdate = isForced || !isDeepEqual(this.sliceItem, prevSliceItem);
        if (!this.sliceItem || !shouldUpdate) {
            this.logger.debug('skip slice area update: ', this.sliceItem);
            return false;
        }
        const upperBottomDiff = this.sliceCount - 1;
        const maxBottomIndex = this.externalProps.itemsKeys.length - 1;
        const sliceByViewAreaRatio = this.config.sliceByViewAreaRatio;
        const notInViewAreaSliceCount = this.sliceCount * ((sliceByViewAreaRatio - 1) / sliceByViewAreaRatio);
        let bottomIndex;
        switch (this.sliceItem.align) {
            case 'center':
                bottomIndex = this.sliceItem.index + Math.round(this.sliceCount * 0.5);
                break;
            case 'upper':
            case 'scrollTop':
                bottomIndex =
                    this.sliceItem.index +
                        (upperBottomDiff - Math.round(notInViewAreaSliceCount / 2));
                break;
            case 'bottom':
                bottomIndex =
                    this.sliceItem.index + Math.round(notInViewAreaSliceCount / 2);
                break;
            default:
                exhaustivenessCheck(this.sliceItem.align);
        }
        let nextBottomIndex = Math.min(maxBottomIndex, bottomIndex);
        const nextUpperIndex = Math.max(0, nextBottomIndex - upperBottomDiff);
        nextBottomIndex = Math.min(maxBottomIndex, nextUpperIndex + upperBottomDiff);
        const nextSliceArea = {
            upperIndex: nextUpperIndex,
            bottomIndex: nextBottomIndex,
        };
        this.logger.debug('Got new slice area', nextSliceArea, this.sliceArea, this.getAnchorAlign());
        if (this.isAreaChanged(this.sliceArea, nextSliceArea)) {
            this.sliceArea = nextSliceArea;
            this.logger.debug('Slice area updated', nextSliceArea);
            return true;
        }
        return false;
    };
    getScrollOptions = (key) => {
        if (!this.content || !this.wrapper) {
            return;
        }
        let element = this.getVirtualItemElement(key);
        if (!element) {
            this.logger.error('getSliceItem no item with slice key: ', this.sliceItem);
            /**
             * В случае, если у нас в this.sliceItem ключ, которого нет в DOM,
             * то берем первый попавшийся dom-элемент с наличием атрибута ключа.
             * Это бывает нужным при изменении ключей элементов, например, при отправке
             * сообщения в чате.
             * См. https://jira.mvk.com/browse/ME-54333.
             */
            element = this.getVirtualItemElement();
        }
        if (!element) {
            this.logger.error('getSliceItem no item: ', this.sliceItem);
            return;
        }
        const { dataset: { itemkey: itemKey }, } = element;
        if (!itemKey) {
            return;
        }
        const { top: elementTop, height: elementHeight } = getOffsetRect(element, this.content);
        if (this.getAnchorAlign() === 'bottom') {
            const margin = this.wrapper.scrollTop +
                this.wrapper.offsetHeight -
                elementTop -
                elementHeight;
            return {
                itemKey,
                align: 'bottom',
                margin,
            };
        }
        return {
            itemKey,
            align: 'upper',
            margin: elementTop - this.wrapper.scrollTop,
        };
    };
    getAnchorAlign() {
        if (this.externalProps?.anchorAlign === 'scrollTop') {
            return 'scrollTop';
        }
        if (this.pinBottom === undefined) {
            return this.externalProps?.anchorAlign ?? 'upper';
        }
        return this.pinBottom ? 'bottom' : 'upper';
    }
    getItemKey = (index) => {
        const key = this.externalProps?.itemsKeys[index];
        if (key === undefined) {
            this.logger.error('No key found for index', index);
            return '';
        }
        return key;
    };
    /**
     * Поиск текущей видимой области `viewArea`
     */
    findViewArea = () => {
        const area = {
            upperIndex: -1,
            bottomIndex: -1,
        };
        if (!this.externalProps) {
            return undefined;
        }
        for (let itemIndex = 0; itemIndex < this.externalProps.itemsKeys.length; itemIndex++) {
            const itemKey = this.getItemKey(itemIndex);
            const virtualItem = this.virtualItems.get(itemKey);
            if (!virtualItem) {
                continue;
            }
            if (virtualItem.isIntersecting) {
                if (area.upperIndex === -1) {
                    area.upperIndex = itemIndex;
                    area.bottomIndex = itemIndex;
                }
                else {
                    area.bottomIndex = itemIndex;
                }
            }
            if (!virtualItem.isIntersecting && area.upperIndex !== -1) {
                break;
            }
        }
        return area.upperIndex === -1 ? undefined : area;
    };
    /**
     * Обновление `viewArea`
     * Может вызываться массово при удалении компонента Реакта из дерева, если такой компонент содержит виртуальный список
     */
    updateViewArea = (nextViewArea) => {
        if (this.isAreaChanged(this.viewArea, nextViewArea)) {
            this.logger.debug('Update view area', nextViewArea);
            this.viewArea = nextViewArea;
            if (this.externalProps?.featureFlags.vkm_performance_boost) {
                this.externalProps?.onViewAreaChange?.(this.viewArea);
                return;
            }
            if (this.onViewAreaChangeTimeout) {
                window.clearTimeout(this.onViewAreaChangeTimeout);
            }
            this.onViewAreaChangeTimeout = window.setTimeout(() => this.externalProps?.onViewAreaChange?.(this.viewArea));
        }
    };
    /**
     * Получение ключа элемента из его `dataset`
     */
    getVirtualItemKey = (target) => {
        const { dataset: { itemkey: itemKey }, } = target;
        if (!itemKey) {
            if (isDev) {
                throw new Error("itemkey wasn't found at element's dataset");
            }
            return '';
        }
        return itemKey;
    };
    forcedSetPinBottom(pinBottom) {
        if (this.nextPinBottom?.timeoutId) {
            window.clearTimeout(this.nextPinBottom.timeoutId);
        }
        this.pinBottom = pinBottom;
    }
    /**
     * Поиск DOM элемента внутри списка
     */
    getVirtualItemElement = (itemKey) => {
        const element = this.wrapper?.querySelector(itemKey ? `[data-itemkey="${itemKey}"]` : `[data-itemkey]`);
        if (!itemKey) {
            this.logger.error('getVirtualItemElement without itemKey: ', element);
        }
        if (!element) {
            return;
        }
        return element;
    };
    /**
     * Сравнение двух `Area`
     */
    isAreaChanged = (firstArea, secondArea) => {
        return (firstArea?.upperIndex !== secondArea?.upperIndex ||
            firstArea?.bottomIndex !== secondArea?.bottomIndex);
    };
    logger = {
        debug: (...args) => {
            if (this.externalProps?.debugLog) {
                // eslint-disable-next-line no-console
                console.log('[VLIST]:', ...args);
            }
        },
        error: (...args) => {
            if (this.externalProps?.debugLog) {
                console.error('[VLIST]:', ...args);
            }
        },
    };
}
//# sourceMappingURL=VirtualizerCore.js.map