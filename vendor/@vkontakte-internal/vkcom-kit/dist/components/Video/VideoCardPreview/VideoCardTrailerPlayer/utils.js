export const playErrorHandler = (error) => {
    if (['AbortError', 'NotAllowedError', 'NotSupportedError'].includes(error.name) ||
        [20, 9].includes(error.code)) {
        // AbortError: Вызов play() инициирует асинхронную загрузку видео, в процессе которой вызов других методов генерирует исключение, код 20 то же самое
        // NotAllowedError: Браузер запретил автоплей
        // Обе не фатальные и поделать с ними нечего. Остальные выкинем дальше.
        // NotSupportedError[9] - ошибка CORS либо загрузки контента, в нашем случае вероятнее всего второе. Заглушим ошибку.
        return;
    }
    throw error;
};
//# sourceMappingURL=utils.js.map