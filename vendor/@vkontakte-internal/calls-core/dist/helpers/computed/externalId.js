import { ExternalIdType } from '@vkontakte/calls-sdk';
import { vkIdToPeerId } from '../simple';
import { EMPTY_USER_ID } from '../../constants';
export function getDefaultExternalId(id) {
    return {
        deviceIdx: 0,
        id: id ?? vkIdToPeerId(EMPTY_USER_ID),
        type: ExternalIdType.USER,
    };
}
//# sourceMappingURL=externalId.js.map