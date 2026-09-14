import { convertButtons } from '../converter/BotKeyboardConverter';
import { fromApiPhoto } from '../converter/AttachConverter';
export function fromApiTemplate(apiTemplate, messageAccessKey) {
    return {
        kind: 'Carousel',
        elements: apiTemplate.elements?.map((element) => convertElement(element, messageAccessKey)) || [],
    };
}
function convertElement({ buttons, photo, action, ...other }, messageAccessKey) {
    const convertedPhoto = photo
        ? fromApiPhoto({ apiPhoto: photo, messageAccessKey })
        : null;
    const base = {
        buttons: buttons ? convertButtons(buttons, true) : [],
        ...(convertedPhoto && { photo: convertedPhoto }),
        ...other,
    };
    const simpleElement = {
        ...base,
        kind: 'Simple',
    };
    if (!action) {
        return simpleElement;
    }
    switch (action.type) {
        case 'open_photo': {
            if (!convertedPhoto) {
                return simpleElement;
            }
            return {
                ...base,
                kind: 'Photo',
                photo: convertedPhoto,
            };
        }
        case 'open_link':
        case 'open_modal_view': {
            return {
                ...base,
                kind: 'Link',
                link: action.link,
            };
        }
        default:
            const _typeguard = action;
            return simpleElement;
    }
}
//# sourceMappingURL=BotTemplateConverter.js.map