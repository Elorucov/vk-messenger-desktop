import '../../ui/ComposerInput/ComposerInput.css';
import { Editor } from '../../ui/ComposerInput/ComposerEditor';
import cx from 'classnames';
import React, { useEffect, useLayoutEffect, useRef, useState, } from 'react';
import { useFeatureFlags } from '../../hooks/misc';
export const ComposerInput = ({ id, className, inputClassName, placeholderClassName, placeholder, value, inputMode, onCreate, onClick, }) => {
    const $ref = useRef(null);
    const $contentEditable = useRef(null);
    const { vkm_composer_input_whitespace } = useFeatureFlags();
    const [isEmpty, setEmpty] = useState(true);
    /**
     * Костыль для устранения утечки памяти.
     * Если в css есть селектор вида .literally:empty+.anything, то при анмаунте
     * компонента, содержащего contenteditable элемент, все DOM дерево выше утекает и
     * попадает в detached ноды.
     * Тут самостоятельно создаем contenteditable элемент и не даем реакту управлять им,
     * это помогает избежать утечки.
     */
    useLayoutEffect(() => {
        const domElement = document.createElement('span');
        domElement.setAttribute('contenteditable', 'true');
        domElement.setAttribute('class', cx('ComposerInput__input', vkm_composer_input_whitespace &&
            'ComposerInput____input--whitesSpaceRefactored', inputClassName));
        domElement.dataset.placeholder = placeholder;
        id && domElement.setAttribute('id', id);
        inputMode && domElement.setAttribute('inputmode', inputMode);
        $ref.current?.appendChild(domElement);
        const editor = new Editor(domElement);
        const checkIsEmpty = (text) => {
            setEmpty(text.length === 0);
        };
        const cleanUpOnContentChange = editor.onContentChange(checkIsEmpty);
        onCreate(editor);
        $contentEditable.current = domElement;
        return () => {
            cleanUpOnContentChange();
            $contentEditable.current = null;
            domElement.remove();
        };
    }, 
    // eslint-disable-next-line
    []);
    useEffect(() => {
        const contentEditable = $contentEditable.current;
        if (!contentEditable) {
            return;
        }
        id && contentEditable.setAttribute('id', id);
        inputMode && contentEditable.setAttribute('inputmode', inputMode);
        if (value) {
            contentEditable.textContent = value;
            setEmpty(false);
        }
        contentEditable.setAttribute('class', cx('ComposerInput__input', vkm_composer_input_whitespace &&
            'ComposerInput____input--whitesSpaceRefactored', inputClassName, 'ComposerInput__input--fixed'));
        contentEditable.setAttribute('role', 'textbox');
        contentEditable.setAttribute('aria-multiline', 'true');
        placeholder && contentEditable.setAttribute('aria-label', placeholder);
    }, [
        id,
        inputClassName,
        inputMode,
        placeholder,
        value,
        vkm_composer_input_whitespace,
    ]);
    return (React.createElement("div", { role: "presentation", className: cx('ComposerInput', className) },
        isEmpty && (React.createElement("span", { "aria-hidden": "true", className: cx('ComposerInput__placeholder', placeholderClassName) }, placeholder)),
        React.createElement("div", { ref: $ref, role: "presentation", onClick: onClick })));
};
//# sourceMappingURL=ComposerInput.js.map