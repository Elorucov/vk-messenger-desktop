import { Component } from 'react';
import { debugMessage, DebugMessageType } from '@vkontakte/calls-sdk';
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error, info) {
        debugMessage(DebugMessageType.ERROR, { error, info });
        this.props.onError?.();
        this.setState({ hasError: false });
    }
    render() {
        if (this.state.hasError) {
            return null;
        }
        return this.props.children;
    }
}
//# sourceMappingURL=ErrorBoundary.js.map