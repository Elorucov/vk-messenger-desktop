import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2}],"img":["global",{"className":1}]} */
import { memo, useEffect, useRef, useState } from 'react';
import { classNames as cn } from '@vkontakte/vkjs';
import { useTimeout } from '../../hooks/useTimeout';
import { useReactionP2P } from './hooks/useReactionsP2P';
import { currentBrowser } from '../../helpers/currentBrowser';
const ReactionsP2P = ({ src, onEnd }) => {
    const timeout = useTimeout();
    const [out, setOut] = useState(false);
    const refContainer = useRef(null);
    useEffect(() => {
        const onAnimationEnd = () => {
            refContainer.current?.removeEventListener('animationend', onAnimationEnd);
            timeout.add(() => {
                refContainer.current?.addEventListener('animationend', onEnd);
                setOut(true);
            }, 900);
        };
        refContainer.current?.addEventListener('animationend', onAnimationEnd);
        return () => {
            timeout.clear();
            refContainer.current?.removeEventListener('animationend', onEnd);
            refContainer.current?.removeEventListener('animationend', onAnimationEnd);
        };
    }, [src, onEnd]);
    if (!src) {
        return _jsx(_Fragment, {});
    }
    return (_jsx("div", { className: cn('CallsReactionsP2P__reaction', 'CallsReactionsP2P__reaction--in', {
            'CallsReactionsP2P__reaction--out': out,
        }), ref: refContainer, children: _jsx("div", { className: "CallsReactionsP2P__reaction__img-wrap", children: _jsx("img", { className: cn('CallsReactionsP2P__reaction__img', 'CallsReactionsP2P__reaction__img--in', {
                    'CallsReactionsP2P__reaction__img--out': out,
                    'CallsReactionsP2P__reaction__img--ff': currentBrowser.isFirefox,
                }), src: src[0], srcSet: `${src[1]} 1.5x`, alt: "Reaction Smile" }) }) }));
};
/** компонент для отрисовки реакций в п2п звонке */
export const CallReactionsP2P = memo(() => {
    return _jsx(ReactionsP2P, { ...useReactionP2P() });
});
CallReactionsP2P.displayName = 'CallReactionsP2P';
//# sourceMappingURL=CallReactionsP2P.js.map