export class RegexElement {
    /**
     * Псевдо регекс, который войдет в токенайзер. Должен описывать цель текстового поиска
     * Далее он будет обернут в скобки
     * Важно:
     * - он не должен блокировать обходить строки
     * - должен быть экранирован
     * Пример: (id|club)\\d{2,32}
     */
    expression;
    /**
     * Поиск начального символа для регекса из expression. Вставится перед выражением и служит для определения его начала
     * Т.к. по сути описывает текст до выражения, то был Выделен в одельный проп для автоматического преобразования
     * !! Попадает в генератор и должен быть опущен вручную, см. _firstSymbol в примерах
     */
    startSymbolExpression;
    /**
     * Количество скобок в выражении. Используется, чтобы вытащить точное количество match из общего регулярного выражения
     * для автоматического выделения текста до выражения
     */
    parenthesesCount;
    generate;
    constructor(expression, startSymbolExpression, generate) {
        this.expression = expression;
        this.startSymbolExpression = startSymbolExpression;
        this.generate = generate;
        this.parenthesesCount = 0;
        /**
         * Будем считать только открывающиеся скобки, потому что закрывающиеся скобки в регулярке провалидирует компилятор
         */
        for (let index = 0; index < expression.length; index++) {
            const element = expression[index];
            if (element === '(' &&
                expression[index - 1] !== '\\' &&
                expression.slice(index + 1, index + 2) !== '?') {
                this.parenthesesCount += 1;
            }
        }
        if (this.startSymbolExpression?.startsWith('(')) {
            this.parenthesesCount += 1;
        }
    }
    /**
     * Частное вычисление токенов. Не для использования в токенайзере, т.к. долго вычисляет
     */
    exec(text) {
        const match = new RegExp(`${this.startSymbolExpression}${this.expression}`).exec(text);
        if (!match) {
            return;
        }
        return this.generate(match);
    }
}
//# sourceMappingURL=RegexElement.js.map