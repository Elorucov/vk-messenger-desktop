import { useBrowserEnv } from '../hooks/misc';
export const DEFAULT_LIST_ITEM_HEIGHT = 66;
export const DEFAULT_INTEGRATION_LIST_ITEM_HEIGHT = 62;
/**
 * Хук, который возвращает нужную высоту для элемента в списке чатов.
 *
 * Значения:
 * - `64` для VK Me.
 * - `60` для интеграции.
 *
 * @todo Перейти на расчёт высоты ячейки с помощью размеров шрифтов и
 * отступов, удалить этот хук.
 */
export const useConvoListItemHeight = () => {
    const { vkIntegration } = useBrowserEnv();
    return vkIntegration
        ? DEFAULT_INTEGRATION_LIST_ITEM_HEIGHT
        : DEFAULT_LIST_ITEM_HEIGHT;
};
//# sourceMappingURL=useConvoListItemHeight.js.map