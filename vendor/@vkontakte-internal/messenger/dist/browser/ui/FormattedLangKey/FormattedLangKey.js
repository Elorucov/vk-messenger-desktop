import React, { Fragment } from 'react';
import { useBrowserEnv } from '../../hooks/misc';
import { isDev } from '../../../core/utils/misc';
export const FormattedLangKey = (props) => {
    const { lang } = useBrowserEnv();
    const { className, langkey, ...opts } = props;
    return lang.fold(langkey, (x) => React.createElement(React.Fragment, null, x), (xs) => {
        // Если мы находимся в дев окружении, то хотим убрать
        // варнинг про отсутствие ключей у Реакта.
        // Это сделано для красоты АПИ компонента.
        // Иначе во всех местах его использования надо было бы
        // придумывать всякие ключи для замен.
        // При этом в прод билде Реакт сам задефолтится к индексам,
        // поэтому делать операцию клонирования ни к чему.
        if (isDev) {
            xs = xs.map((x, index) => typeof x === 'string' ? (React.createElement(Fragment, { key: index }, x)) : (React.cloneElement(x, { ...x.props, key: index })));
        }
        return React.createElement("span", { className: className }, xs);
    }, 
    /**
     * С типами ниже все сложно, поэтому приходится использовать небольшой хак.
     * Считаем, что тут он не страшен, поскольку место достаточно изолированное
     * и скорее всего не будет меняться никогда.
     */
    // @ts-expect-error
    opts);
};
//# sourceMappingURL=FormattedLangKey.js.map