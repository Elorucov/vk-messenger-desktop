import { __decorate } from "tslib";
import { scope } from '../entitiesDecorators';
/**
 * Контейнер для подписки на события модели страниц для аналитики
 */
let ModelEventsHandlers = class ModelEventsHandlers {
    // Оставляем пустые реализации, чтобы не обязывать делать реализацию хендлеров
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onStartInit(modelInfo) {
        return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onFinishInit(modelInfo) {
        return;
    }
};
ModelEventsHandlers = __decorate([
    scope.transient({ abstract: true })
], ModelEventsHandlers);
export { ModelEventsHandlers };
//# sourceMappingURL=modelEvents.js.map