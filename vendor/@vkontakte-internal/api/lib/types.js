export var APIMode;
(function (APIMode) {
    /**
     * Отправка через execute
     */
    APIMode["PARALLEL"] = "parallel";
    /**
     * Отправка по очереди
     */
    APIMode["SEQUENTIAL"] = "sequential";
})(APIMode || (APIMode = {}));
export var APIRequestMode;
(function (APIRequestMode) {
    /**
     * Отправка с выдержкой интервала
     */
    APIRequestMode["SEQUENTIAL"] = "sequential";
    /**
     * Незамедлительная отправка, может вызывать ошибки при большом количестве запросов
     */
    APIRequestMode["BURST"] = "burst";
})(APIRequestMode || (APIRequestMode = {}));
export var APIRequestMethod;
(function (APIRequestMethod) {
    /**
     * Обычный запрос по сети
     */
    APIRequestMethod["FETCH"] = "fetch";
    /**
     * Выполняет запрос при помощи подключения inline-cкрипта к странице,
     * используйте для обхода CORS
     */
    APIRequestMethod["SCRIPT"] = "script";
    /**
     * Выполняет запрос через VK Bridge,
     * используйте в мини-приложения
     */
    APIRequestMethod["BRIDGE"] = "bridge";
})(APIRequestMethod || (APIRequestMethod = {}));
//# sourceMappingURL=types.js.map