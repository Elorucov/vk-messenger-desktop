import * as Peer from '../../core/model/Peer';
import { fromApiPicture } from '../converter/PictureConverter';
export function fromApiPollVoter(apiPollVoter) {
    return {
        id: Peer.resolveRealId('User', apiPollVoter.id),
        // @ts-expect-error апи обновило криво поля, но они рекваеред
        firstName: apiPollVoter.first_name,
        // @ts-expect-error апи обновило криво поля, но они рекваеред
        lastName: apiPollVoter.last_name,
        photo: fromApiPicture({
            baseUrl: apiPollVoter.photo_base,
            photo50: apiPollVoter.photo_50,
            photo100: apiPollVoter.photo_100,
        }),
        screenName: apiPollVoter.screen_name,
    };
}
//# sourceMappingURL=PollVoterConverter.js.map