// $userEnv должен инициализироваться раньше: конструктор API читает его в момент создания стора
import './userEnv.js';
import { forward } from 'effector';
import { createGate } from 'effector-react';
import { stickersEmojiKeyboard } from './domain.js';
import { API } from '../utils/api';
export const changeAPIOptions = stickersEmojiKeyboard.createEvent();
export const $api = stickersEmojiKeyboard
    .createStore(new API({}))
    .on(changeAPIOptions, (_, { api }) => api);
export const APIGate = createGate();
forward({
    from: APIGate.state,
    to: changeAPIOptions,
});
//# sourceMappingURL=api.js.map