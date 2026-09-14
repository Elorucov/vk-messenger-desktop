import { getIsFullScreen } from '../../../../selectors';
import { MAIN_CONTAINER_FULL_SCREEN_WIDTH, MAIN_CONTAINER_WIDTH, SAUSAGE_CONTAINER_FULL_SCREEN_WIDTH, SAUSAGE_CONTAINER_WIDTH, LISTENER_FULL_SCREEN_CELL_SIZE, LISTENER_CELL_SIZE, LISTENERS_FULL_SCREEN_CARD_HEIGHT, LISTENERS_CARD_HEIGHT, LISTENERS_CARD_WIDTH, LISTENERS_FULL_SCREEN_CARD_WIDTH, SPEAKER_CARD_WIDTH, SPEAKER_CARD_HEIGHT, SPEAKER_FULL_SCREEN_CARD_WIDTH, SPEAKER_FULL_SCREEN_CARD_HEIGHT, } from '../../constants';
export const getVoiceRoomSausageContainerWidth = (state) => getIsFullScreen(state) ? SAUSAGE_CONTAINER_FULL_SCREEN_WIDTH : SAUSAGE_CONTAINER_WIDTH;
export const getVoiceRoomMainContainerWidth = (state) => getIsFullScreen(state) ? MAIN_CONTAINER_FULL_SCREEN_WIDTH : MAIN_CONTAINER_WIDTH;
export const getVoiceRoomListenerSize = (state) => getIsFullScreen(state) ? LISTENER_FULL_SCREEN_CELL_SIZE : LISTENER_CELL_SIZE;
export const getListenersCardHeight = (state) => getIsFullScreen(state) ? LISTENERS_FULL_SCREEN_CARD_HEIGHT : LISTENERS_CARD_HEIGHT;
export const getListenersCardWidth = (state) => getIsFullScreen(state) ? LISTENERS_FULL_SCREEN_CARD_WIDTH : LISTENERS_CARD_WIDTH;
export const getSpeakersCardHeight = (state) => getIsFullScreen(state) ? SPEAKER_FULL_SCREEN_CARD_HEIGHT : SPEAKER_CARD_HEIGHT;
export const getSpeakersCardWidth = (state) => getIsFullScreen(state) ? SPEAKER_FULL_SCREEN_CARD_WIDTH : SPEAKER_CARD_WIDTH;
//# sourceMappingURL=dimensions.js.map