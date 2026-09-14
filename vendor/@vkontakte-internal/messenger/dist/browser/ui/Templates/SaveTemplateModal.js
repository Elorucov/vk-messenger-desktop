import '../../ui/Templates/SaveTemplateModal.css';
import { Button, getColorClass, Spinner } from '@vkontakte-internal/vkcom-kit';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import React from 'react';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import cx from 'classnames';
import { MessageTemplateForm } from '../../ui/Templates/MessageTemplateForm';
import { useTemplateModalForm } from '../../ui/Templates/useTemplateModalForm';
import { Icon28ErrorCircleOutline } from '@vkontakte/icons';
import { useSnackbar } from '../../hooks/useSnackbar';
const MAX_NAME_LENGTH = 200;
const MAX_CONTENT_LENGTH = 2000;
const MIN_CONTENT_LENGTH = 5;
const validateName = (name) => name.length < MAX_NAME_LENGTH;
const validateText = (text) => (text.length < MAX_CONTENT_LENGTH && text.length >= MIN_CONTENT_LENGTH) ||
    text === '';
export const SaveTemplateModal = ({ onClose, ownerId, templateId, }) => {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const { name, text, setName, setText, isLoading, setIsLoading } = useTemplateModalForm(templateId);
    const { isMobileLayout } = useLayoutData();
    const snackbar = useSnackbar();
    const onRequestCompleted = (hasFailed) => {
        setIsLoading(false);
        if (hasFailed) {
            snackbar({
                before: (React.createElement(Icon28ErrorCircleOutline, { className: getColorClass('color_icon_negative') })),
                message: lang.use('me_templates_request_error_snackbar_text'),
            });
        }
        else {
            onClose();
        }
    };
    const saveTemplate = () => {
        setIsLoading(true);
        if (templateId) {
            dispatch({
                type: 'EditCommunityTemplate',
                groupId: ownerId,
                name,
                text,
                templateId,
                requestCompletedUICallback: onRequestCompleted,
            });
        }
        else {
            dispatch({
                type: 'AddCommunityTemplate',
                groupId: ownerId,
                name,
                text,
                requestCompletedUICallback: onRequestCompleted,
            });
        }
    };
    return (React.createElement(ModalInterface, { onClose: onClose, closeLabel: lang.use('me_close'), contextClass: cx('MEConfig', 'SaveTemplateModal', isMobileLayout && 'SaveTemplateModal--mobile'), title: templateId
            ? lang.use('me_templates_change_template_modal_header')
            : lang.use('me_templates_new_template_modal_header'), buttons: [
            React.createElement(Button, { mode: "secondary", key: "cancel", onClick: onClose, size: "m" }, lang.use('me_cancel')),
            React.createElement(Button, { mode: "primary", key: "submit", onClick: saveTemplate, disabled: !(name &&
                    text &&
                    validateName(name) &&
                    name.length > 1 &&
                    validateText(text)) || isLoading, size: "m" }, isLoading ? (React.createElement(Spinner, { size: "s" })) : templateId ? (lang.use('me_templates_edit_template_modal_submit')) : (lang.use('me_templates_new_template_modal_submit'))),
        ] },
        React.createElement("div", { className: "SaveTemplateModal__container" },
            React.createElement(MessageTemplateForm, { setName: setName, setText: setText, name: name, text: text, isLoading: isLoading, validateName: validateName, validateText: validateText }))));
};
//# sourceMappingURL=SaveTemplateModal.js.map