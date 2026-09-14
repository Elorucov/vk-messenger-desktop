import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
import { Group, Header, Spacing, Div } from '@vkontakte-internal/vkcom-kit';
export class HistoryScreenErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Call history crashed:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (_jsxs("div", { children: [_jsx(Spacing, { size: 16 }), _jsx(Group, { header: _jsx(Header, { separator: true, children: this.props.getLang('global_error') }), children: _jsx(Div, { children: this.props.getLang('global_unexpected_error_try_later') }) })] }));
        }
        else {
            return this.props.children;
        }
    }
}
//# sourceMappingURL=HistoryScreenErrorBoundary.js.map