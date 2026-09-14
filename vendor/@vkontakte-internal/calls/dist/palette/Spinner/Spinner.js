import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1,"style":1}],"svg":["global",{"className":1}],"g":["global",{"style":1}],"style":["global",{"dangerouslySetInnerHTML":1}],"circle":["global",{"className":1,"style":1}]} */
import { Component } from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
import { vkuiCssVars } from '@vkontakte-internal/vkcom-kit';
// Индикатор загрузки
export default class Spinner extends Component {
    constructor(props) {
        super(props);
        this.c = 0;
        this.offset = 0;
        this.animation = '';
        this.id = Math.round(Math.random() * 1e6).toString(16);
        this.setSpinnerParams(props);
    }
    static { this.defaultProps = {
        color: '#5181b8',
        size: 19,
        strokeWidth: 2,
        duration: 1.4,
        className: '',
    }; }
    // TODO: [Fix me] Don't use deprecated React methods
    // eslint-disable-next-line @typescript-eslint/naming-convention
    UNSAFE_componentWillReceiveProps(nextProps) {
        this.setSpinnerParams(nextProps);
    }
    setSpinnerParams(props) {
        this.offset = Math.round(Math.PI * props.size);
        this.c = 0.5 * props.size;
        this.animation = keyframes('dash' + this.id, {
            '0%': {
                'stroke-dashoffset': this.offset,
            },
            '50%': {
                'stroke-dashoffset': Math.round(0.25 * this.offset),
                'transform': 'rotate(135deg)',
            },
            '100%': {
                'stroke-dashoffset': this.offset,
                'transform': 'rotate(360deg)',
            },
        });
    }
    render() {
        const { style, color = vkuiCssVars.colorIconSecondary.normal.value, size, duration, strokeWidth, className, ...restProps } = this.props;
        const { id, offset, animation } = this;
        const classNames = cx('Spinner', className);
        return (_jsx("div", { ...restProps, className: classNames, style: style, children: _jsx("svg", { className: "Spinner__svg", width: size, height: size, viewBox: `0 0 ${size} ${size}`, xmlns: "http://www.w3.org/2000/svg", children: _jsxs("g", { style: {
                        width: size,
                        height: size,
                        transformOrigin: 0.5 * size + 'px ' + 0.5 * size + 'px',
                    }, children: [_jsx("style", { dangerouslySetInnerHTML: { __html: animation } }), _jsx("circle", { className: "Spinner__path", fill: "none", stroke: color, strokeDasharray: offset, strokeDashoffset: offset, strokeWidth: strokeWidth, style: {
                                animationName: 'dash' + id,
                                animationTimingFunction: 'ease-in-out',
                                animationDuration: duration + 's',
                                animationIterationCount: 'infinite',
                            }, cx: 0.5 * size, cy: 0.5 * size, r: 0.5 * size - 0.5 * strokeWidth })] }) }) }));
    }
}
function keyframes(name, obj) {
    if (!name || !obj) {
        return '';
    }
    const selectors = Object.keys(obj)
        .map((key) => {
        return (key +
            ' {' +
            Object.keys(obj[key])
                .map((k) => k + ':' + obj[key][k])
                .join(';') +
            '}');
    })
        .join('');
    return `@-webkit-keyframes ${name} {${selectors}} @keyframes ${name} {${selectors}}`;
}
//# sourceMappingURL=Spinner.js.map