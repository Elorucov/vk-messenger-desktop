import React, { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { Button, FormItem, FormLayoutGroup, Input, } from '@vkontakte/vkui';
import cx from 'classnames';
import { isValidPhoneNumber } from '../../../core/utils/misc';
import * as Peer from '../../../core/model/Peer';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import { useRouter } from '../../ui/Router/Router';
import { useImportContact } from '../../ui/ImportContactModal/useImportContact';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import '../../ui/ImportContactModal/InputContactModal.css';
import { useFormatPhoneNumber } from '../../hooks/useFormatPhoneNumber';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
const MAX_TEXT_LENGTH = 250;
const defaultFormValue = (value) => ({
    status: 'default',
    value: value ?? '',
});
const isFormStatusMapKey = (key) => {
    return ['phone', 'name', 'surname'].some((e) => key === e);
};
const initialDataToForm = (initialData) => {
    const data = {
        phone: defaultFormValue(initialData.phone),
        name: defaultFormValue(initialData.name),
        surname: defaultFormValue(initialData.surname),
    };
    return data;
};
/**
 * Модалка с формой для ввода номера телефона, имени и фамилии контакта
 */
export const InputContactModal = ({ initialData, onFromChange, onClose, openInviteModal, setContactPhone, }) => {
    const { lang } = useBrowserEnv();
    const { navigate } = useRouter();
    const { isLoading: isContactsRequestPending, importContact } = useImportContact();
    const [formItems, setFormItems] = useState(initialData
        ? initialDataToForm(initialData)
        : {
            phone: defaultFormValue(),
            name: defaultFormValue(),
            surname: defaultFormValue(),
        });
    const dispatch = useDispatch();
    const isSubmitButtonDisabled = useMemo(() => !(formItems.phone.value && formItems.name.value.trim()), [formItems.name.value, formItems.phone.value]);
    const { isReady, format } = useFormatPhoneNumber();
    const setFormItem = useCallback((field, value) => {
        setFormItems((prev) => {
            const newFormStatus = { ...prev };
            newFormStatus[field] = value;
            return newFormStatus;
        });
    }, []);
    const handleFormItemChange = useCallback(async (e) => {
        const field = e.target.name;
        if (!isFormStatusMapKey(field) || !isReady)
            return;
        switch (field) {
            case 'phone':
                const value = format(e.target.value);
                setFormItem(field, {
                    status: 'default',
                    value,
                });
                break;
            default:
                setFormItem(field, {
                    status: 'default',
                    value: e.target.value.trim(),
                });
        }
    }, [format, isReady, setFormItem]);
    const handleFormSubmit = useCallback(async () => {
        const phone = formItems.phone.value;
        const name = formItems.name.value;
        const surname = formItems.surname.value;
        if (!isValidPhoneNumber(phone)) {
            return setFormItem('phone', { status: 'error', value: phone });
        }
        if (name.length === 0) {
            return setFormItem('name', { status: 'error', value: name });
        }
        const data = await importContact({ phone, name, surname });
        if (data.hasFailed) {
            setContactPhone(phone);
            openInviteModal();
        }
        else {
            dispatch({
                type: 'ImportContact',
                profile: data.profile,
                contact: data.contact,
            });
            navigate({
                kind: 'ConvoRoute',
                peerId: data.profile?.id
                    ? Peer.resolveRealId('User', data.profile.id)
                    : Peer.resolveRealId('Contact', data.contact.id),
                entrypoint: 'contacts_list',
            });
            onClose();
        }
    }, [
        dispatch,
        formItems.name.value,
        formItems.phone.value,
        formItems.surname.value,
        importContact,
        navigate,
        onClose,
        openInviteModal,
        setContactPhone,
        setFormItem,
    ]);
    const isLoading = isContactsRequestPending || !isReady;
    useEffect(() => {
        const values = {
            name: formItems.name.value,
            surname: formItems.surname.value,
            phone: formItems.phone.value,
        };
        onFromChange?.(values);
    }, [formItems, onFromChange]);
    return (React.createElement(ModalInterface, { title: lang.use('me_contacts_import_modal_title'), closeLabel: lang.use('me_close'), onClose: onClose, buttons: React.createElement(Button, { disabled: isSubmitButtonDisabled, loading: isLoading, mode: "primary", onClick: handleFormSubmit }, lang.use('me_contacts_import_add_button')), contextClass: 'MEConfig', withCustomLayout: true },
        React.createElement(Form, { formItems: formItems, onFormItemChange: handleFormItemChange, onSubmit: handleFormSubmit })));
};
const Form = ({ formItems, onFormItemChange, onSubmit, }) => {
    const { isMobileLayout } = useLayoutData();
    const isModalFullScreen = isMobileLayout;
    const { lang } = useBrowserEnv();
    const $phoneInput = useRef(null);
    useEffect(() => {
        if ($phoneInput.current) {
            $phoneInput.current.focus();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (React.createElement("form", { className: cx('ImportContactModal', {
            'ImportContactModal--fullScreen': isModalFullScreen,
        }), onSubmit: (e) => {
            // Не даем странице перегружаться.
            e.preventDefault();
            onSubmit();
        } },
        React.createElement(FormItem, { top: React.createElement(FormItem.Top, null,
                React.createElement(FormItem.TopLabel, null,
                    lang.use('me_contacts_import_modal_phone_input'),
                    ' ',
                    React.createElement("span", { className: "InputContactModal__requiredSymbol" }, "*"))), status: formItems.phone.status, topComponent: "h5" },
            React.createElement(Input, { getRef: $phoneInput, type: "tel", maxLength: MAX_TEXT_LENGTH, autoComplete: "tel", name: "phone", value: formItems.phone.value, onChange: onFormItemChange, placeholder: lang.use('me_contacts_import_tel_placeholder'), required: true })),
        React.createElement(FormLayoutGroup, { mode: "horizontal" },
            React.createElement(FormItem, { top: React.createElement(FormItem.Top, null,
                    React.createElement(FormItem.TopLabel, null,
                        lang.use('me_contacts_import_modal_name_input'),
                        ' ',
                        React.createElement("span", { className: "InputContactModal__requiredSymbol" }, "*"))), status: formItems.name.status, topComponent: "h5" },
                React.createElement(Input, { maxLength: MAX_TEXT_LENGTH, type: "text", name: "name", autoComplete: "given-name", value: formItems.name.value, onChange: onFormItemChange, required: true })),
            React.createElement(FormItem, { top: lang.use('me_contacts_import_modal_surname_input'), topComponent: "h5" },
                React.createElement(Input, { maxLength: MAX_TEXT_LENGTH, type: "text", name: "surname", autoComplete: "family-name", value: formItems.surname.value, onChange: onFormItemChange })))));
};
//# sourceMappingURL=InputContactModal.js.map