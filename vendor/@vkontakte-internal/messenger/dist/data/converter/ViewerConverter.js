import * as Peer from '../../core/model/Peer';
import { fromApiPicture } from '../converter/PictureConverter';
import { getClearBaseUrl } from '../../core/model/Picture';
export function fromApiViewerAccount(
// В Api schema неправильно указано название возвращаемой переменной
apiAccountGetMultiResponseItem) {
    const id = Peer.resolveRealId('User', apiAccountGetMultiResponseItem.id);
    return {
        id,
        profileType: fromApiProfileType(apiAccountGetMultiResponseItem.profile_type),
        firstName: apiAccountGetMultiResponseItem.first_name ?? '',
        lastName: apiAccountGetMultiResponseItem.last_name ?? '',
        photo: fromApiPicture({
            baseUrl: apiAccountGetMultiResponseItem.photo_base,
            photo100: apiAccountGetMultiResponseItem.photo_100,
        }),
        isService: apiAccountGetMultiResponseItem.is_service_account ||
            apiAccountGetMultiResponseItem.is_service,
    };
}
export function fromApiViewerProfileInfo(apiAccountGetProfileInfoResponse) {
    const { screen_name: screenName, phone: phoneNumber, id, photo_200, first_name: firstName, last_name: lastName, nick_name: nickName, is_service_account: isServiceAccount, bdate, is_esia_verified: isEsiaVerified, } = apiAccountGetProfileInfoResponse;
    return {
        screenName,
        phoneNumber,
        id: Peer.resolveRealId('User', id),
        avatarPhoto: fromApiPicture({
            // AccountUserSettings не содержит чистый бейзурл, но его можно взять из имеющегося изображения. Задача на поддержку - VKIDACC-3943
            baseUrl: getClearBaseUrl(photo_200),
            photo200: photo_200,
        }),
        firstName,
        lastName,
        nickName,
        isServiceAccount,
        bdate,
        isEsiaVerified,
    };
}
export function fromApiValidateProfileInfo(apiValidateProfileInfo) {
    const { is_error, fields } = apiValidateProfileInfo;
    return {
        isError: is_error,
        fields: fields?.map(({ field_name, error_code, error_msg, error_text }) => ({
            name: field_name,
            code: error_code,
            msg: error_msg,
            text: error_text,
        })),
    };
}
export function fromApiProfileType(type) {
    const profileTypeMap = {
        0: 'normal',
        2: 'edu',
    };
    return profileTypeMap[type ?? 0] ?? 'normal';
}
//# sourceMappingURL=ViewerConverter.js.map