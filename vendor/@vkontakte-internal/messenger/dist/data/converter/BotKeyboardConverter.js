import { unescape } from '@vkontakte/vkjs';
import { resolveMiniAppId } from '../../core/model/Attach';
import * as BotKeyboard from '../../core/model/BotKeyboard';
import * as Peer from '../../core/model/Peer';
import { VK_PAY_APP_ID } from '../../core/config/config';
function convertColorToButtonModeAndAppearance(color, inline) {
    if (color === 'positive') {
        return {
            mode: 'primary',
            appearance: 'positive',
        };
    }
    if (color === 'negative') {
        return {
            mode: 'primary',
            appearance: 'negative',
        };
    }
    if (color === 'primary') {
        return {
            mode: 'primary',
        };
    }
    // TODO: должна быть возможность выключения в фастчатах
    const isChatBackgroundEnabled = true;
    return inline && !isChatBackgroundEnabled
        ? {
            mode: 'primary',
            appearance: 'overlay',
        }
        : {
            mode: 'secondary',
        };
}
export function fromApiKeyboard(keyboard, peerId) {
    const buttons = convertRowButtons(keyboard.buttons, keyboard.inline);
    const authorId = Peer.resolveId(keyboard.author_id || peerId);
    return keyboard.inline
        ? {
            kind: 'InlineKeyboard',
            authorId,
            buttons,
        }
        : {
            kind: 'InputKeyboard',
            authorId,
            buttons,
            oneTime: keyboard.one_time,
        };
}
export function fromEngineKeyboard(keyboard, peerId) {
    if (keyboard.inline) {
        return keyboard.buttons
            ? {
                kind: 'InlineKeyboard',
                buttons: convertRowButtons(keyboard.buttons, keyboard.inline),
                authorId: Peer.resolveId(keyboard.author_id || peerId),
            }
            : undefined;
    }
    else {
        if (!keyboard.buttons?.length) {
            return {
                kind: 'InputKeyboardDeleteEvent',
            };
        }
        const buttons = convertRowButtons(keyboard.buttons, keyboard.inline);
        return {
            kind: 'InputKeyboardUpsertEvent',
            keyboard: {
                kind: 'InputKeyboard',
                buttons,
                authorId: Peer.resolveId(keyboard.author_id || peerId),
                oneTime: keyboard.one_time,
            },
        };
    }
}
function convertButton(button, inline) {
    const options = convertColorToButtonModeAndAppearance(button.color, inline);
    switch (button.action.type) {
        case 'text':
            return {
                type: button.action.type,
                label: unescape(button.action.label || ''),
                payload: button.action.payload || '',
                ...options,
            };
        case 'open_link':
        case 'open_modal_view':
            return {
                type: button.action.type,
                link: button.action.link,
                label: unescape(button.action.label || ''),
                payload: button.action.payload || '',
                ...options,
            };
        case 'location':
            return {
                type: button.action.type,
                payload: button.action.payload || '',
                ...options,
            };
        case 'vkpay':
            return {
                type: button.action.type,
                payload: button.action.payload || '',
                appId: resolveMiniAppId(VK_PAY_APP_ID),
                hash: button.action.hash || '',
            };
        case 'open_app':
            return {
                type: button.action.type,
                payload: button.action.payload || '',
                label: unescape(button.action.label || ''),
                hash: button.action.hash || '',
                appId: resolveMiniAppId(button.action.app_id),
                ownerId: button.action.owner_id
                    ? Peer.resolveId(button.action.owner_id)
                    : undefined,
                ...options,
            };
        case 'callback':
            return {
                type: button.action.type,
                label: unescape(button.action.label || ''),
                payload: button.action.payload || '',
                ...options,
            };
        case 'open_photo':
            return;
        default:
            const _typeguard = button.action;
            return;
    }
}
function convertRowButtons(buttons, inline) {
    return buttons.map((row) => convertButtons(row, inline));
}
export function convertButtons(buttons, inline) {
    return buttons
        .map((button) => convertButton(button, inline))
        .filter((item) => item !== undefined);
}
export const fromApiMessageEvent = (peer, owner, event) => {
    const { event_id, action, owner_id } = event;
    const id = BotKeyboard.resolveEventId(event_id);
    const ownerId = Peer.resolveId(owner_id);
    if (action) {
        switch (action.type) {
            case 'show_snackbar': {
                return {
                    type: action.type,
                    id,
                    ownerId,
                    text: action.text,
                    title: Peer.name(peer),
                    photo: owner.photo?.photo50,
                    peerId: peer.id,
                };
            }
            case 'open_link':
            case 'open_modal_view': {
                return {
                    type: action.type,
                    id,
                    ownerId,
                    link: action.link,
                    title: Peer.name(peer),
                    peerId: peer.id,
                };
            }
            case 'open_app': {
                return {
                    type: action.type,
                    id,
                    ownerId,
                    appId: resolveMiniAppId(action.app_id),
                    hash: action.hash,
                    peerId: peer.id,
                };
            }
            default: {
                const _typeguard = action;
            }
        }
    }
    // Событие с типом null приходит без типа и action'а
    return {
        type: 'null',
        id,
        ownerId,
        peerId: peer.id,
    };
};
//# sourceMappingURL=BotKeyboardConverter.js.map