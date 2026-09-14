import { exhaustivenessCheck } from '../../core/utils/misc';
const UNSUPPORTED_BUTTON_TYPE = 'UNSUPPORTED_BUTTON_TYPE';
export function fromApiConvoCardButton(apiButton) {
    switch (apiButton.type) {
        case 'accept_message_request':
        case 'reject_message_request':
        case 'send_message_request':
            return {
                layout: apiButton.layout || 'primary',
                style: apiButton.style || 'regular',
                text: apiButton.text ?? '',
                type: apiButton.type,
            };
        case 'open_miniapp':
            return {
                layout: apiButton.layout || 'primary',
                style: apiButton.style || 'regular',
                text: apiButton.text ?? '',
                type: apiButton.type,
                appId: apiButton.miniapp_id ?? 0,
            };
        case 'custom_action':
            // TODO: имплементировать в рамках задачи ME-79288
            return UNSUPPORTED_BUTTON_TYPE;
        default:
            exhaustivenessCheck(apiButton.type);
    }
}
export function fromApiConvoCard(card) {
    const buttons = (card.buttons ?? [])
        .map(fromApiConvoCardButton)
        .filter((button) => button !== UNSUPPORTED_BUTTON_TYPE);
    switch (card.type) {
        case 'profile':
            return {
                id: card.id,
                type: 'profile',
                content: card.content ?? '',
                buttons,
            };
        case 'custom':
            return {
                id: card.id,
                type: 'custom',
                title: card.title ?? '',
                subtitle: card.subtitle,
                content: card.content ?? '',
                image: card.image ?? '',
                buttons,
            };
        case 'gift':
            // TODO: имплементировать в рамках задачи ME-79288
            return undefined;
        default:
            exhaustivenessCheck(card.type);
    }
}
//# sourceMappingURL=ConvoCardConverter.js.map