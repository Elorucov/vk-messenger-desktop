import { Component } from 'react';
import { CallsEventType, Mode } from '@vkontakte-internal/calls-core';
import { sendTrackEvents } from '../services/backend';
export class CallsErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
        };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error) {
        switch (this.props.mode) {
            case Mode.CALL: {
                this.props.SDK.hangup();
                break;
            }
            case Mode.INCOMING: {
                this.props.SDK.declineCall();
                break;
            }
        }
        sendTrackEvents([
            {
                e: 'calls_ok_crash',
                exception_type: `calls_ok_crash: ${error.message}`,
            },
        ]);
        console.error('Calls crashed:', error, error);
        this.props.eventBus.emit(CallsEventType.FATAL_ERROR, { error });
        this.props.onReset();
        this.setState({
            hasError: false,
        });
    }
    render() {
        return this.state.hasError ? null : this.props.children;
    }
}
//# sourceMappingURL=CallsErrorBoundary.js.map