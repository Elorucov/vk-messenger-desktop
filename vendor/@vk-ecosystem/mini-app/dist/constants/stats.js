import { MiniAppEvents } from './events.js';

const BRIDGE_STAT_CALL_ARGUMENTS_MAX_LENGTH=256;const BRIDGE_LOG_MAX_LENGTH=256;const MAX_INT32=0x7fffffff;const BridgeMethodsToLogCallArgumentsDefault=[MiniAppEvents.TrackEvent];

export { BRIDGE_LOG_MAX_LENGTH, BRIDGE_STAT_CALL_ARGUMENTS_MAX_LENGTH, BridgeMethodsToLogCallArgumentsDefault, MAX_INT32 };
