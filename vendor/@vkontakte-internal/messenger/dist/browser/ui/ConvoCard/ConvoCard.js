import React, { useCallback, useEffect, useMemo } from 'react';
import * as Peer from '../../../core/model/Peer';
import { Avatar } from '../../ui/Avatar/Avatar';
import { Button } from '@vkontakte/vkui';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import '../../ui/ConvoCard/ConvoCard.css';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import { resolveMiniAppId } from '../../../core/model/Attach';
import { useRouter } from '../../ui/Router/Router';
import { useModal } from '../../hooks/useModal';
import { AlertInterface, } from '../../ui/AlertInterface/AlertInterface';
import { useSnackbar } from '../../hooks/useSnackbar';
import { Icon28CheckCircleOutline } from '@vkontakte/icons';
import { getLogEventLabel } from '../../../data/utils/typeMessagingActionItem';
/**
 * Карточка которая показывает баннер в беседе
 * Особенность – этот баннер работает через conversation_card в модели беседы
 * Особенность №2 – этот баннер не является Placeholder'ом, и может показываться совместно с историей
 */
export const ConvoCard = ({ card, peer }) => {
    const dispatch = useDispatch();
    const { navigate } = useRouter();
    const { lang, stats } = useBrowserEnv();
    const snackbar = useSnackbar();
    const rejectionConfirmationModal = useModal();
    const rejectMessageRequest = useCallback(() => {
        if (!Peer.isUserPeerId(peer.id) && !Peer.isContactPeerId(peer.id)) {
            return;
        }
        rejectionConfirmationModal.close();
        dispatch({
            type: 'UserRejectedMessageRequest',
            peerId: peer.id,
            isNewMR: true,
        });
        stats.logEvent({
            type: 'type_action',
            type_action: {
                type: 'type_messaging_action_item',
                type_messaging_action_item: {
                    action_type: 'reject_request_dialog_confirm',
                    peer_id: peer.id,
                    label: getLogEventLabel(),
                },
            },
        });
    }, [dispatch, stats, peer, rejectionConfirmationModal]);
    const actions = useMemo(() => [
        {
            title: lang.use('me_back'),
            autoClose: true,
            mode: 'cancel',
        },
        {
            title: lang.use('me_reject_edu_mr_button_name'),
            mode: 'destructive',
            action: rejectMessageRequest,
        },
    ], [lang, rejectMessageRequest]);
    useEffect(() => {
        if (!card.id) {
            return;
        }
        stats.logEvent({
            type: 'type_view',
            screen: 'im',
            type_view: {
                type: 'type_im_conversations_banner_view',
                item: {
                    type: 'banner',
                },
                position: 0,
                start_view: '',
                end_view: '',
                type_im_conversations_banner_view: {
                    banner_name: card.id,
                    user2_id: peer.id,
                },
            },
        });
    }, [stats, card, peer]);
    const onMessageRequestRejectionClose = () => {
        rejectionConfirmationModal.close();
        stats.logEvent({
            type: 'type_action',
            type_action: {
                type: 'type_messaging_action_item',
                type_messaging_action_item: {
                    action_type: 'reject_request_dialog_back',
                    peer_id: peer.id,
                    label: getLogEventLabel(),
                },
            },
        });
    };
    const renderButton = (button) => {
        // Цвет кнопки
        let appearance = 'accent';
        if (button.style === 'destructive') {
            appearance = 'negative';
        }
        const onClick = () => {
            switch (button.type) {
                // Принять запрос на общение
                case 'accept_message_request':
                    if (!Peer.isUserPeerId(peer.id) && !Peer.isContactPeerId(peer.id)) {
                        break;
                    }
                    dispatch({
                        type: 'UserAcceptedChatMessageRequest',
                        peerId: peer.id,
                    });
                    break;
                // Отклонить запрос на общение
                case 'reject_message_request':
                    rejectionConfirmationModal.open();
                    break;
                // Отправить запрос на общение
                case 'send_message_request':
                    if (!Peer.isUserPeerId(peer.id) && !Peer.isContactPeerId(peer.id)) {
                        break;
                    }
                    dispatch({
                        type: 'UserSentMessageRequest',
                        peerId: peer.id,
                    });
                    snackbar({
                        message: lang.use('me_edu_message_request_sent_snack_title'),
                        before: (React.createElement(Icon28CheckCircleOutline, { className: "ConvoCard__snackIcon" })),
                    });
                    break;
                // Открыть мини-апп
                case 'open_miniapp':
                    navigate({
                        kind: 'MiniAppModal',
                        miniAppId: resolveMiniAppId(button.appId),
                    });
                    break;
                default:
                    exhaustivenessCheck(button);
            }
        };
        return (React.createElement(Button, { "data-testid": `convo_card_mr_button_${button.type}`, key: button.type, mode: button.layout, appearance: appearance, onClick: onClick }, button.text));
    };
    const roles = useMemo(() => {
        if (peer.kind !== 'User') {
            return null;
        }
        if (peer.eduRoles?.organizations.length === 0) {
            return peer.eduRoles?.mainRole ?? null;
        }
        const organization = peer.eduRoles?.organizations[0];
        if (!organization) {
            return null;
        }
        const roles = organization.roles.reduce((acc, role, index) => acc.concat(React.createElement("div", { key: index }, role.name)), []);
        return (React.createElement("div", null,
            React.createElement("div", null, organization.name),
            roles));
    }, [peer]);
    const render = () => {
        switch (card.type) {
            /**
             * Кастомная карточка с сервера
             * Сервер сам собирает баннер и клиенты его отображают
             * Решает сразу многие продуктовые сценарии средствами сервера без отдельных доработок и релизов клиентов
             */
            case 'custom':
                return (React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "ConvoCard__image", "aria-hidden": true },
                        React.createElement("img", { alt: "", src: card.image, "data-testid": "convo_card_mr_image" })),
                    React.createElement("div", { className: "ConvoCard__title", "data-testid": "convo_card_mr_title" }, card.title),
                    card.subtitle && (React.createElement("div", { className: "ConvoCard__subtitle", "data-testid": "convo_card_mr_subtitle" }, card.subtitle)),
                    React.createElement("div", { className: "ConvoCard__divider" }),
                    card.content && (React.createElement("div", { className: "ConvoCard__content", "data-testid": "convo_card_mr_content" }, card.content)),
                    card.buttons.length > 0 && (React.createElement("div", { className: "ConvoCard__actions" }, card.buttons.map(renderButton)))));
            /**
             * Карточка, которая отображает данные про пира с кнопками и текстом которые пришлет сервер
             */
            case 'profile':
                return (React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "ConvoCard__image" },
                        React.createElement(Avatar, { peer: peer, size: 72 })),
                    React.createElement("div", { className: "ConvoCard__title", "data-testid": "convo_card_mr_title" }, Peer.name(peer)),
                    roles && (React.createElement("div", { className: "ConvoCard__subtitle", "data-testid": "convo_card_mr_subtitle" }, roles)),
                    React.createElement("div", { className: "ConvoCard__divider" }),
                    card.content && (React.createElement("div", { className: "ConvoCard__content", "data-testid": "convo_card_mr_content" }, card.content)),
                    card.buttons.length > 0 && (React.createElement("div", { className: "ConvoCard__actions" }, card.buttons.map(renderButton)))));
            default:
                exhaustivenessCheck(card);
        }
    };
    return (React.createElement("div", { className: "ConvoCard" },
        render(),
        rejectionConfirmationModal.isActive && (React.createElement(AlertInterface, { onClose: onMessageRequestRejectionClose, contextClass: "MEConfig", title: lang.use('me_reject_edu_mr_title'), actions: actions, description: lang.use('me_reject_edu_mr_description') }))));
};
//# sourceMappingURL=ConvoCard.js.map