import '../../ui/ChannelActionModal/ChannelActionModal.css';
import React, { useCallback, useId } from 'react';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { ModalHeader } from '../../ui/ModalHeader/ModalHeader';
import { ModalBody } from '../../ui/ModalBody/ModalBody';
import { ModalFooter } from '../../ui/ModalFooter/ModalFooter';
import { Button } from '@vkontakte/vkui';
import { useRouter } from '../../ui/Router/Router';
export const DeleteChannelPostModal = ({ ownerId, postCmid, isPostponed, handleModalClose, }) => {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const modalTitleId = useId();
    const { screenRoute, navigate } = useRouter();
    const handleDeleteModalSubmit = useCallback(() => {
        if (screenRoute.kind === 'ChannelRoute' &&
            postCmid === screenRoute.postponed) {
            // Убираем postponed cmid из роута
            navigate({ ...screenRoute, postponed: true });
        }
        dispatch({
            type: 'UserChangedChannelPost',
            channelId: ownerId,
            cmid: postCmid,
            isPostponed: isPostponed,
            userAction: {
                kind: 'delete',
            },
        });
        handleModalClose();
    }, [
        dispatch,
        navigate,
        ownerId,
        postCmid,
        isPostponed,
        screenRoute,
        handleModalClose,
    ]);
    return (React.createElement(ModalView, { onEscape: handleModalClose, contextClass: "MEConfig" },
        React.createElement(ModalBackdrop, { onClick: handleModalClose },
            React.createElement(ModalPanel, { className: "ChannelActionModal__panel", ariaLabelledby: modalTitleId },
                React.createElement(ModalHeader, { closeLabel: lang.use('me_close'), onClose: handleModalClose, title: lang.use('me_channel_post_delete_modal_title'), titleId: modalTitleId }),
                React.createElement(ModalBody, null, lang.use('me_channel_post_delete_modal_text')),
                React.createElement(ModalFooter, { buttons: [
                        React.createElement(Button, { mode: "tertiary", key: "cancel", onClick: handleModalClose }, lang.use('me_cancel')),
                        React.createElement(Button, { mode: "primary", key: "submit", onClick: handleDeleteModalSubmit }, lang.use('me_channel_post_action_delete_submit')),
                    ] })))));
};
//# sourceMappingURL=DeleteChannelPostModal.js.map