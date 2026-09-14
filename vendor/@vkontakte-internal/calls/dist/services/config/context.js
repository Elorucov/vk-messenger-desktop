import { Config } from '@vkontakte-internal/calls-core';
import { configContextCreator } from './configContextCreator';
const { useConfig, CallsConfigProvider } = configContextCreator(new Config());
export { useConfig, CallsConfigProvider };
//# sourceMappingURL=context.js.map