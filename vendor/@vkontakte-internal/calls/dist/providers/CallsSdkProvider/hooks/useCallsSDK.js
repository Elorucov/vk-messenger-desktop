import { useContext } from 'react';
import { CallsSdkContext } from '../lib/CallsSdkContext';
export function useCallsSDK() {
    const SDK = useContext(CallsSdkContext);
    if (SDK === null) {
        throw Error('Calls sdk context has not been Provided!');
    }
    return SDK;
}
//# sourceMappingURL=useCallsSDK.js.map