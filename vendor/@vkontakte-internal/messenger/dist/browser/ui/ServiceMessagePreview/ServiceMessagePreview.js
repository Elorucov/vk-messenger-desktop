import cx from 'classnames';
import React from 'react';
import { usePeers, useOwner, useBrowserEnv, useThemeStyles, useViewer, } from '../../hooks/misc';
import * as Peer from '../../../core/model/Peer';
import * as Viewer from '../../../core/model/Viewer';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import '../../ui/ServiceMessagePreview/ServiceMessagePreview.css';
import { FormattedLangKey } from '../../ui/FormattedLangKey/FormattedLangKey';
import { Link, ExternalLink } from '../../ui/Link/Link';
import { PlainText } from '../../ui/PlainText/PlainText';
export const ServiceMessagePreview = ({ message, onScrollToMessage, isRich = false }) => {
    const peers = usePeers();
    const owner = useOwner();
    const { viewer, profileType } = useViewer();
    const { lang, vkDomain } = useBrowserEnv();
    const initiator = Peer.safeGet(peers, message.authorId);
    const isUser = initiator.kind === 'User';
    const { styles } = useThemeStyles();
    const isEdu = Viewer.isEdu(profileType);
    switch (message.action.type) {
        case 'cannot_call_privacy_settings': {
            if (!initiator.id || !isUser) {
                return null;
            }
            return viewer.id === initiator.id
                ? lang.use('me_service_message_cannot_call_message')
                : lang.use('me_service_message_missed_call_message', {
                    sex: initiator.sex,
                    values: {
                        name: Peer.firstName(initiator),
                    },
                });
        }
        case 'chat_photo_remove':
        case 'chat_photo_update':
        case 'chat_group_call_started':
        case 'chat_invite_user_by_link': {
            const key = `me_service_${message.action.type}`;
            const values = {
                user: React.createElement(PeerRenderer, { isRich: isRich, peer: initiator }),
            };
            return isUser ? (React.createElement(FormattedLangKey, { langkey: key, sex: initiator.sex, values: values })) : (React.createElement(FormattedLangKey, { langkey: `${key}_community`, values: values }));
        }
        case 'chat_pin_message':
        case 'chat_unpin_message': {
            const hasChunks = !!message.action.chunks.length;
            const key = hasChunks
                ? `me_service_${message.action.type}`
                : `me_service_${message.action.type}_custom_text`;
            const cmid = message.action.cmid;
            const values = {
                user: React.createElement(PeerRenderer, { isRich: isRich, peer: initiator }),
                message: (React.createElement(Highlight, { isRich: isRich, onClick: onScrollToMessage
                        ? () => {
                            onScrollToMessage({
                                peerId: message.peerId,
                                cmid,
                            });
                        }
                        : undefined }, hasChunks ? (React.createElement(PlainText, { chunks: message.action.chunks, multiline: false })) : (React.createElement(FormattedLangKey, { langkey: "me_message" })))),
            };
            return isUser ? (React.createElement(FormattedLangKey, { langkey: key, sex: initiator.sex, values: values })) : (React.createElement(FormattedLangKey, { langkey: `${key}_community`, values: values }));
        }
        case 'chat_create': {
            const key = `me_service_${message.action.type}`;
            const values = {
                user: React.createElement(PeerRenderer, { isRich: isRich, peer: initiator }),
                title: React.createElement(Highlight, { isRich: isRich }, message.action.title),
            };
            return isUser ? (React.createElement(FormattedLangKey, { langkey: key, sex: initiator.sex, values: values })) : (React.createElement(FormattedLangKey, { langkey: `${key}_community`, values: values }));
        }
        case 'chat_title_update': {
            const key = `me_service_${message.action.type}`;
            const values = {
                user: React.createElement(PeerRenderer, { isRich: isRich, peer: initiator }),
                title: React.createElement(Highlight, { isRich: isRich }, message.action.title),
                old_title: (React.createElement(Highlight, { isRich: isRich }, message.action.oldTitle)),
            };
            return isUser ? (React.createElement(FormattedLangKey, { langkey: key, sex: initiator.sex, values: values })) : (React.createElement(FormattedLangKey, { langkey: `${key}_community`, values: values }));
        }
        case 'chat_invite_user':
        case 'chat_kick_user': {
            const key = `me_service_${message.action.type}`;
            const target = Peer.safeGet(peers, message.action.peerId);
            if (initiator.id === target.id && isUser) {
                return (React.createElement(FormattedLangKey, { langkey: `${key}_own`, sex: initiator.sex, values: {
                        user: React.createElement(PeerRenderer, { isRich: isRich, peer: initiator }),
                    } }));
            }
            const values = {
                user: React.createElement(PeerRenderer, { isRich: isRich, peer: initiator }),
                target: React.createElement(PeerRenderer, { isRich: isRich, peer: target, nameCase: "acc" }),
            };
            return isUser ? (React.createElement(FormattedLangKey, { langkey: key, sex: initiator.sex, values: values })) : (React.createElement(FormattedLangKey, { langkey: `${key}_community`, values: values }));
        }
        case 'chat_owner_changed':
        case 'chat_without_owner_admin': {
            const key = `me_service_${message.action.type}`;
            const target = Peer.safeGet(peers, message.action.peerId);
            return (React.createElement(FormattedLangKey, { langkey: key, sex: target.kind === 'User' ? target.sex : 'unknown', values: {
                    target: React.createElement(PeerRenderer, { isRich: isRich, peer: target }),
                } }));
        }
        case 'chat_invite_user_by_message_request': {
            const key = `me_service_${message.action.type}`;
            const target = Peer.safeGet(peers, message.action.peerId);
            return (React.createElement(FormattedLangKey, { langkey: key, sex: isUser ? initiator.sex : 'unknown', values: {
                    user: React.createElement(PeerRenderer, { isRich: isRich, peer: target }),
                    target: (React.createElement(PeerRenderer, { isRich: isRich, peer: initiator, nameCase: "acc" })),
                } }));
        }
        case 'chat_invite_user_by_call': {
            const key = `me_service_${message.action.type}`;
            const target = Peer.safeGet(peers, message.action.peerId);
            return (React.createElement(FormattedLangKey, { langkey: key, sex: isUser ? initiator.sex : 'unknown', values: {
                    user: React.createElement(PeerRenderer, { isRich: isRich, peer: initiator }),
                    target: (React.createElement(PeerRenderer, { isRich: isRich, peer: target, nameCase: "acc" })),
                } }));
        }
        case 'chat_invite_user_by_call_join_link': {
            const key = `me_service_${message.action.type}`;
            return (React.createElement(FormattedLangKey, { langkey: key, sex: isUser ? initiator.sex : 'unknown', values: {
                    user: React.createElement(PeerRenderer, { isRich: isRich, peer: initiator }),
                } }));
        }
        case 'sent_message_requests_count':
            const key = `me_service_${message.action.type}`;
            return React.createElement(FormattedLangKey, { langkey: key, num: message.action.count });
        case 'chat_screenshot': {
            const key = `me_service_${message.action.type}`;
            if (initiator.id === owner.id) {
                return React.createElement(FormattedLangKey, { langkey: "me_service_chat_screenshot_own" });
            }
            const values = {
                user: React.createElement(PeerRenderer, { isRich: isRich, peer: initiator }),
            };
            return isUser ? (React.createElement(FormattedLangKey, { langkey: key, sex: initiator.sex, values: values })) : (React.createElement(FormattedLangKey, { langkey: `${key}_community`, values: values }));
        }
        case 'chat_without_owner_admins':
        case 'chat_without_owner_all':
        case 'chat_kick_don': {
            const key = `me_service_${message.action.type}`;
            return React.createElement(FormattedLangKey, { langkey: key });
        }
        /**
         * Запрос на общение был отправлен (Сферум)
         */
        case 'sent_message_request': {
            const isOutcomingRequest = message.action.from === viewer.id;
            const key = `me_service_${message.action.type}_${isOutcomingRequest ? 'outcoming' : 'incoming'}`;
            return React.createElement(FormattedLangKey, { langkey: key });
        }
        /**
         * Запрос на общение был отклонен (Сферум)
         */
        case 'rejected_message_request': {
            const key = `me_service_${message.action.type}`;
            return React.createElement(FormattedLangKey, { langkey: key });
        }
        case 'conversation_style_update':
        case 'conversation_style_update_action': {
            const [from, style, sex] = [
                React.createElement(PeerRenderer, { isRich: isRich, peer: initiator }),
                message.action.styleId && (React.createElement(Highlight, { isRich: isRich }, styles.get(message.action.styleId)?.title)),
                isUser ? initiator.sex : 'unknown',
            ];
            return style ? (React.createElement(FormattedLangKey, { langkey: "me_service_conversation_style_update_link", sex: sex, values: {
                    style,
                    from,
                    link: (linkName) => (React.createElement(ExternalLink, { disabled: !isRich, className: "ServiceMessagePreview__link", href: `https://${vkDomain}/@vk-chat-themes` }, linkName)),
                } })) : (React.createElement(FormattedLangKey, { langkey: "me_service_reset_chat_theme", sex: sex, values: { from } }));
        }
        case 'chat_kick_user_call_block': {
            const key = `me_service_${message.action.type}`;
            const target = Peer.safeGet(peers, message.action.peerId);
            const values = {
                target: React.createElement(PeerRenderer, { isRich: isRich, peer: target }),
            };
            return target.id === owner.id ? (React.createElement(FormattedLangKey, { langkey: `${key}_you` })) : (React.createElement(FormattedLangKey, { langkey: key, sex: target.sex, values: values }));
        }
        /**
         * Запрос на общение был принят (старый, и новый в Сферуме)
         */
        case 'accepted_message_request': {
            if (isEdu) {
                const key = `me_service_${message.action.type}_edu`;
                return React.createElement(FormattedLangKey, { langkey: key });
            }
            const key = `me_service_${message.action.type}`;
            const target = Peer.safeGet(peers, message.action.peerId);
            const values = {
                target: target.kind === 'User' && target.contactName ? (React.createElement(Highlight, { isRich: isRich }, target.contactName)) : (React.createElement(PeerRenderer, { isRich: isRich, peer: target })),
            };
            return React.createElement(FormattedLangKey, { langkey: key, values: values });
        }
        case 'custom': {
            return React.createElement(PlainText, { chunks: message.action.chunks, multiline: false });
        }
        case 'call_transcription_failed':
            return React.createElement(FormattedLangKey, { langkey: "me_service_call_transcription_failed" });
        case 'unknown':
            return React.createElement(FormattedLangKey, { langkey: "me_unsupported_message" });
        default:
            exhaustivenessCheck(message.action);
    }
};
function PeerRenderer({ isRich, peer, nameCase = 'nom', }) {
    const name = Peer.name(peer, nameCase);
    if (isRich) {
        return (React.createElement(Link, { className: "ServiceMessage__link", to: {
                kind: 'PeerPanel',
                peerId: peer.id,
                screenName: Peer.screenName(peer),
            } }, name));
    }
    return React.createElement(React.Fragment, null, name);
}
function Highlight({ children, isRich, ...props }) {
    if (isRich) {
        return (React.createElement("span", { ...props, className: cx(props.className, 'ServiceMessage__highlight', !!props.onClick && 'ServiceMessage__link') }, children));
    }
    return React.createElement(React.Fragment, null, children);
}
//# sourceMappingURL=ServiceMessagePreview.js.map