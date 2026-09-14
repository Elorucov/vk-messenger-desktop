import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"input":["global",{"className":1}]} */
import { Component, } from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
export default class Input extends Component {
    static { this.defaultProps = {
        type: 'text',
        initialValue: '',
        alignment: 'left',
    }; }
    constructor(props) {
        super(props);
        this.onChange = (e) => {
            if (!this.isControlledOutside) {
                this.setState({ value: e.target.value });
            }
            if (this.props.onChange) {
                this.props.onChange(e);
            }
        };
        this.getRef = (element) => {
            if (this.props.getRef) {
                if (typeof this.props.getRef === 'function') {
                    this.props.getRef(element);
                }
                else {
                    this.props.getRef.current = element;
                }
            }
        };
        this.onFocus = (e) => {
            if (this.props.onFocus) {
                this.props.onFocus(e);
            }
        };
        if (typeof props.value !== 'undefined' || props.isControlledOutside) {
            this.isControlledOutside = true;
        }
        else {
            this.state = {
                value: typeof props.initialValue !== 'undefined' ? props.initialValue : '',
            };
        }
    }
    render() {
        const { alignment, value, onChange, initialValue, className, isControlledOutside, isError, getRef, ...nativeProps } = this.props;
        const modifiers = {
            'Input--left': alignment === 'left',
            'Input--center': alignment === 'center',
            'Input--right': alignment === 'right',
            'Input--error': !!isError,
        };
        return (_jsx("input", { ...nativeProps, className: cx('Input', modifiers, className), ref: getRef ? this.getRef : undefined, value: this.isControlledOutside ? value : this.state.value, onChange: this.onChange, onFocus: this.onFocus }));
    }
}
//# sourceMappingURL=Input.js.map