import React from 'react';
import * as TextChunk from '../../../core/model/TextChunk';
import './CodeBlock.css';
export const CodeBlock = ({ code }) => {
    /**
     * Синтаксис у блока кода такой:
     * before
     * ```
     * бла бла бла
     * ```
     * after
     * Мы распарсим это сообщение так:
     * (text)before (br)\n (code)\nбла бла бла\n (br)\n (text)after
     *
     * То есть:
     * 1) у нас уже есть br перед началом блока и после его окончания
     * 2) но так же у нас есть br в начале и конце внутри блока
     * 3) однако для отображения блока мы буквально просто удаляем ```\n:
     *    с ``` справляется парсер, а последующий \n в начале и конце
     *    мы удаляем здесь
     */
    const trimmedCode = code.text.replace(/^\n/, '').replace(/\n$/, '');
    if (!trimmedCode) {
        return React.createElement("span", { className: "CodeBlock" }, TextChunk.toRawText([code]));
    }
    return React.createElement("span", { className: "CodeBlock" }, trimmedCode);
};
//# sourceMappingURL=CodeBlock.js.map