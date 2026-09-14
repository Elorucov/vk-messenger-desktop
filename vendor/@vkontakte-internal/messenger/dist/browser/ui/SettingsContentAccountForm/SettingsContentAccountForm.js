import { Group, FormItem, Input, Select, DateInput, Button, Calendar, RichCell, Title, Text, Spacing, } from '@vkontakte/vkui';
import { Icon20CalendarOutline, Icon16CopyOutline, Icon28CopyOutline, Icon24Copy, } from '@vkontakte/icons';
import React, { useState } from 'react';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useAccountForm } from './useAccountForm';
import { useBrowserEnv } from '../../hooks/misc';
import { CopyText } from '../../ui/CopyText/CopyText';
import { EditingNotAvailableModal } from './EditingNotAvailableModal';
import { useStatsOnMount } from '../../hooks/useStatsOnMount';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import './SettingsContentAccountForm.css';
export const SettingsContentAccountForm = () => {
    const { lang } = useBrowserEnv();
    const snackbar = useSnackbar();
    const { values, errors, disabled, isEsiaVerified, editingNotAvailableModal, loading, handleChange, handleSubmit, } = useAccountForm();
    const [isOpenCalendar, setIsOpenCalendar] = useState(false);
    const openCalendar = () => {
        setIsOpenCalendar(true);
    };
    const closeCalendar = () => {
        setIsOpenCalendar(false);
    };
    const onCopyDone = () => {
        snackbar({
            message: lang.use('me_convo_profile_id_copy_notification'),
            before: React.createElement(Icon28CopyOutline, { color: "var(--vkui--color_text_link)" }),
        });
    };
    useStatsOnMount({
        type: 'type_navgo',
        type_navgo: {
            screen: 'edu_edit_profile',
        },
    });
    if (isEsiaVerified) {
        return (React.createElement(Group, { mode: "card", className: "SettingsContentAccountForm__group" },
            React.createElement(Spacing, { size: 42 }),
            React.createElement("div", { className: "SettingsContentAccountForm__banner" },
                React.createElement("div", null,
                    React.createElement(EsiaIcon, null)),
                React.createElement("div", null,
                    React.createElement(Title, { level: "3", weight: "3", Component: "h3", useAccentWeight: true }, lang.use('me_banner_connected_esia_title')),
                    React.createElement(Text, null, lang.use('me_banner_connected_esia_text')))),
            React.createElement("div", { className: "SettingsContentAccountForm__grid" },
                React.createElement(RichCell, { overTitle: lang.use('me_account_field_name_label'), disabled: true }, values.firstName),
                React.createElement(RichCell, { overTitle: lang.use('me_account_field_last_name_label'), disabled: true }, values.lastName),
                React.createElement(RichCell, { overTitle: lang.use('me_account_field_nick_name_label'), disabled: true }, values.nickName),
                React.createElement(RichCell, { overTitle: lang.use('me_account_field_sex_label'), disabled: true }, values.sex === 'female'
                    ? lang.use('me_sex_field_female')
                    : lang.use('me_sex_field_male')),
                React.createElement(RichCell, { overTitle: lang.use('me_account_field_bdate_label'), disabled: true }, values.bdate?.toLocaleDateString()),
                React.createElement(CopyText, { text: String(values.id), onCopyDone: onCopyDone },
                    React.createElement(RichCell, { overTitle: lang.use('me_account_id_label'), after: React.createElement(Icon24Copy, { color: "var(--vkui--color_text_accent)" }), contentAlign: "center", afterAlign: "center" }, values.id)))));
    }
    return (React.createElement(Group, { mode: "card", className: "SettingsContentAccountForm__group" },
        React.createElement(Spacing, { size: 42 }),
        editingNotAvailableModal.isActive && (React.createElement(EditingNotAvailableModal, { handleClose: editingNotAvailableModal.close })),
        React.createElement("div", { className: "SettingsContentAccountForm__groupContent" },
            React.createElement(FormItem, { top: lang.use('me_account_field_name_label'), status: errors?.firstName ? 'error' : 'default', bottom: errors?.firstName, topComponent: "h5" },
                React.createElement(Input, { placeholder: lang.use('me_account_field_name_placeholder'), value: values.firstName, disabled: loading, onChange: handleChange('firstName'), "data-type": "firstName" })),
            React.createElement(FormItem, { top: lang.use('me_account_field_last_name_label'), status: errors?.lastName ? 'error' : 'default', bottom: errors?.lastName, topComponent: "h5" },
                React.createElement(Input, { placeholder: lang.use('me_account_field_last_name_placeholder'), value: values.lastName, disabled: loading, onChange: handleChange('lastName') })),
            React.createElement(FormItem, { top: lang.use('me_account_field_nick_name_label'), status: errors?.nickName ? 'error' : 'default', bottom: errors?.nickName, topComponent: "h5" },
                React.createElement(Input, { placeholder: lang.use('me_account_field_nick_name_placeholder'), value: values.nickName, disabled: loading, onChange: handleChange('nickName') })),
            React.createElement(FormItem, { top: lang.use('me_account_field_sex_label'), status: errors?.sex ? 'error' : 'default', bottom: errors?.sex, topComponent: "h5" },
                React.createElement(Select, { value: values.sex, name: "sex", disabled: loading, options: [
                        {
                            label: lang.use('me_sex_field_male'),
                            value: 'male',
                        },
                        {
                            label: lang.use('me_sex_field_female'),
                            value: 'female',
                        },
                    ], onChange: handleChange('sex') })),
            React.createElement(FormItem, { top: lang.use('me_account_field_bdate_label'), status: errors?.bdate ? 'error' : 'default', bottom: errors?.bdate, topComponent: "h5" },
                React.createElement(Dropdown, { open: isOpenCalendar, openType: "click", content: React.createElement(Calendar, { value: values.bdate, onChange: (date) => {
                            handleChange('bdate')(date);
                            closeCalendar();
                        }, minDateTime: getBdateMinDate(), maxDateTime: getBdateMaxDate() }), align: "left", position: "bottom", classNames: {
                        wrapper: 'ConvoProfileActions__menu',
                        trigger: 'ConvoProfileActions__trigger',
                        contentWrapper: 'ConvoProfileActions__menuContent',
                    }, onClose: closeCalendar, onOpen: openCalendar },
                    React.createElement(DateInput, { disabled: loading, value: values.bdate, onChange: handleChange('bdate'), after: React.createElement(Icon20CalendarOutline, null), className: "SettingsContentAccountForm__bdate", disableCalendar: true, onFocusCapture: openCalendar }))),
            React.createElement("div", { className: "SettingsContentAccountForm__copyFormItem" },
                React.createElement(CopyText, { text: String(values.id), onCopyDone: onCopyDone },
                    React.createElement(FormItem, { top: lang.use('me_account_id_label'), topComponent: "h5" },
                        React.createElement(Input, { disabled: true, value: values.id, after: React.createElement(Icon16CopyOutline, { color: "var(--vkui--color_icon_accent)" }) }))))),
        React.createElement(FormItem, null,
            React.createElement(Button, { loading: loading, disabled: disabled, onClick: handleSubmit }, lang.use('me_save')))));
};
function getBdateMinDate() {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 119);
    return date;
}
function getBdateMaxDate() {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 6);
    return date;
}
const EsiaIcon = () => {
    return (React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "28", height: "28", viewBox: "0 0 28 28", fill: "none" },
        React.createElement("path", { d: "M11.8998 14.1103H9.5464C9.52238 14.1103 9.51038 14.1225 9.49837 14.147C9.43833 15.2373 9.23421 16.4011 8.94603 17.3566C8.94603 17.3688 8.94603 17.3811 8.95804 17.3933C8.97005 17.4056 8.98206 17.4056 8.99406 17.4056H9.79855C9.82257 17.4056 9.83457 17.3933 9.83457 17.3811C10.0627 16.6461 10.2428 15.6905 10.3149 14.882H11.0833V17.3688C11.0833 17.3933 11.1073 17.4178 11.1314 17.4178H11.8998C11.9238 17.4178 11.9479 17.3933 11.9479 17.3688V14.147C11.9479 14.1225 11.9238 14.1103 11.8998 14.1103ZM21.8539 14.1103H21.0854C21.0614 14.1103 21.0374 14.1348 21.0374 14.1593V16.6461C20.8693 16.6951 20.7012 16.7196 20.509 16.7196C20.0047 16.7196 19.8847 16.5603 19.8847 15.8743V14.1593C19.8847 14.1348 19.8606 14.1103 19.8366 14.1103H19.0802C19.0562 14.1103 19.0321 14.1348 19.0321 14.1593V15.96C19.0321 17.0871 19.4044 17.5158 20.3529 17.5158C20.8933 17.5158 21.5056 17.3688 21.8659 17.2341C21.8779 17.2218 21.8899 17.2096 21.8899 17.1973V14.1593C21.9019 14.1225 21.8779 14.1103 21.8539 14.1103ZM5.57199 14.1103H4.79152C4.7675 14.1103 4.7555 14.1225 4.7555 14.147C4.63542 14.637 4.38327 15.47 4.04707 16.3398L3.2666 14.147C3.25459 14.1348 3.24258 14.1225 3.23057 14.1225H2.43809C2.42609 14.1225 2.41408 14.1348 2.40207 14.147C2.39006 14.1593 2.39006 14.1715 2.40207 14.1838L3.57878 17.4668C3.45871 17.7241 3.35065 17.9323 3.24258 18.1283C3.15853 18.2753 3.08649 18.4224 3.01444 18.5694C3.00244 18.5816 3.00244 18.5939 3.01444 18.6061C3.02645 18.6184 3.03846 18.6306 3.05046 18.6306H3.90298C3.91499 18.6306 3.939 18.6184 3.939 18.6061C4.08309 18.3244 4.2632 17.9323 4.4313 17.5281C4.93561 16.3276 5.33185 15.2005 5.63203 14.1715C5.63203 14.1593 5.63203 14.147 5.62002 14.1348C5.59601 14.1103 5.584 14.1103 5.57199 14.1103ZM8.36969 16.6461C8.36969 16.6338 8.35768 16.6216 8.34567 16.6216H8.30965C8.11753 16.6951 7.76932 16.7441 7.52918 16.7441C6.98885 16.7441 6.7367 16.5971 6.7367 15.764C6.7367 15.0903 6.82075 14.784 7.52918 14.784C7.7333 14.784 7.91341 14.8085 8.15355 14.882C8.17757 14.882 8.18958 14.882 8.20158 14.8575C8.28563 14.686 8.3937 14.4778 8.51377 14.2205V14.1838C8.51377 14.1715 8.50177 14.1593 8.48976 14.1593C8.17757 14.0613 7.80534 14 7.46914 14C6.35246 14 5.84816 14.539 5.84816 15.7518C5.84816 16.9768 6.35246 17.5281 7.46914 17.5281C7.74531 17.5281 8.30965 17.4668 8.57381 17.3566C8.59782 17.3443 8.60983 17.3198 8.59782 17.2953L8.36969 16.6461ZM15.6821 14.1103H14.9016C14.8776 14.1103 14.8656 14.1225 14.8656 14.147C14.7455 14.6493 14.4934 15.47 14.1572 16.3398L13.3767 14.147C13.3647 14.1348 13.3527 14.1225 13.3407 14.1225H12.5482C12.5362 14.1225 12.5242 14.1348 12.5122 14.147C12.5002 14.1593 12.5002 14.1715 12.5122 14.1838L13.6889 17.4668C13.5688 17.7241 13.4608 17.9323 13.3527 18.1283C13.2687 18.2753 13.1966 18.4224 13.1246 18.5816C13.1126 18.5939 13.1126 18.6061 13.1246 18.6184C13.1366 18.6306 13.1486 18.6429 13.1606 18.6429H14.0131C14.0251 18.6429 14.0491 18.6306 14.0491 18.6184C14.1932 18.3366 14.3733 17.9446 14.5414 17.5403C15.0337 16.3398 15.442 15.2128 15.7422 14.1838C15.7422 14.1715 15.7422 14.1593 15.7301 14.147C15.7061 14.1103 15.6941 14.1103 15.6821 14.1103ZM18.5639 14.1103H16.2945C16.2705 14.1103 16.2465 14.1348 16.2465 14.1593V17.3811C16.2465 17.4056 16.2705 17.4301 16.2945 17.4301H17.063C17.087 17.4301 17.111 17.4056 17.111 17.3811V14.8943H18.2997C18.3117 14.8943 18.3357 14.882 18.3357 14.8698C18.4318 14.6493 18.5158 14.4165 18.6119 14.1838V14.147C18.5879 14.1103 18.5759 14.1103 18.5639 14.1103Z", fill: "#EF4058" }),
        React.createElement("path", { d: "M6.53487 9.38111C5.41743 9.38111 4.98017 9.86475 4.98017 11.0859C4.98017 12.3313 5.41743 12.8149 6.53487 12.8149C7.66445 12.8149 8.10171 12.3313 8.10171 11.0859C8.10171 9.85265 7.66445 9.38111 6.53487 9.38111ZM6.53487 12.1015C6.02473 12.1015 5.86684 11.9685 5.86684 11.098C5.86684 10.1791 6.03688 10.0945 6.53487 10.0945C7.045 10.0945 7.21505 10.1791 7.21505 11.098C7.21505 11.9685 7.05715 12.1015 6.53487 12.1015ZM11.2111 11.9685C11.2111 11.9565 11.199 11.9444 11.1868 11.9444H11.1504C10.956 12.0169 10.6038 12.0653 10.3609 12.0653C9.8143 12.0653 9.55924 11.9202 9.55924 11.098C9.55924 10.433 9.64426 10.1307 10.3609 10.1307C10.5674 10.1307 10.7495 10.1549 10.9925 10.2275C11.0168 10.2275 11.0289 10.2275 11.0411 10.2033C11.1261 10.034 11.2354 9.82847 11.3569 9.57457V9.5383C11.3569 9.5262 11.3447 9.51411 11.3326 9.51411C11.0168 9.41739 10.6402 9.35693 10.3001 9.35693C9.17056 9.35693 8.66043 9.88893 8.66043 11.0859C8.66043 12.295 9.17056 12.8391 10.3001 12.8391C10.5795 12.8391 11.1504 12.7786 11.4176 12.6698C11.4419 12.6577 11.454 12.6335 11.4419 12.6094L11.2111 11.9685ZM4.73725 9.46575H2.44165C2.41736 9.46575 2.39307 9.48993 2.39307 9.51411V12.694C2.39307 12.7182 2.41736 12.7424 2.44165 12.7424H3.219C3.24329 12.7424 3.26758 12.7182 3.26758 12.694V10.2275H4.45789C4.47004 10.2275 4.49433 10.2154 4.49433 10.2033C4.5915 9.98565 4.67652 9.75593 4.77369 9.5262V9.48993C4.76155 9.47784 4.7494 9.46575 4.73725 9.46575Z", fill: "#1466AC" }),
        React.createElement("path", { d: "M25.4864 17.2086V17.1595C25.4864 17.135 25.4864 17.0982 25.4985 17.0736C25.5347 16.6196 25.5589 16.0675 25.583 15.4294V15.3804C25.5951 14.9509 25.6072 14.4847 25.6072 14.0061C25.6072 13.5276 25.5951 13.0613 25.583 12.6319V12.5828C25.5589 11.9571 25.5347 11.3926 25.4985 10.9387C25.4985 10.9141 25.4985 10.8773 25.4864 10.8528V10.8037C25.4864 10.7546 25.4743 10.7178 25.4743 10.6687V10.6196C25.4381 10.1411 25.4139 9.84663 25.4018 9.82209C25.4018 9.77301 25.3897 9.72393 25.3897 9.68712V9.65031C25.3777 9.56442 25.3656 9.4908 25.3414 9.40491C25.3414 9.39264 25.3414 9.38037 25.3293 9.3681C25.1239 8.37423 24.5803 7.28221 23.9037 6.46012C23.6379 6.1411 23.36 5.8589 23.0701 5.63804C23.0459 5.6135 22.7076 5.3681 22.176 4.98773C21.5599 4.55828 20.6779 3.95706 19.6752 3.3681C17.8871 2.30061 16.3044 1.55215 16.0869 1.46626C16.0748 1.46626 16.0748 1.45399 16.0748 1.45399C15.6037 1.2454 15.0358 1.09816 14.4197 1.03681C14.2989 1.02454 14.178 1.01227 14.0572 1.01227C13.9364 1 13.8277 1 13.7189 1H13.5498C12.7282 1.02454 11.9671 1.17178 11.363 1.45399C11.2785 1.4908 9.67161 2.23926 7.84729 3.33129L7.7748 3.3681C5.90216 4.48466 4.44029 5.58896 4.37988 5.63804C3.92078 5.9816 3.51 6.42331 3.13548 6.98773C3.0509 7.11043 3.0509 7.42945 3.41335 7.42945H4.34363C4.74233 7.42945 4.83898 7.18405 5.286 6.85276C5.78134 6.48466 6.75995 5.74847 8.54802 4.66871C9.84075 3.89571 11.0489 3.28221 11.6409 3C11.653 3 11.6651 2.98773 11.6772 2.98773C11.6772 2.98773 11.6892 2.98773 11.6892 2.97546C11.6892 2.97546 11.7013 2.97546 11.7013 2.96319C11.7134 2.96319 11.7255 2.95092 11.7255 2.95092C11.7376 2.95092 11.7496 2.93865 11.7617 2.93865C11.9067 2.86503 12.0034 2.82822 12.0034 2.82822C12.4141 2.64417 12.994 2.52147 13.6102 2.5092H13.8518C14.0331 2.5092 14.2143 2.52147 14.3834 2.54601C14.758 2.59509 15.0962 2.66871 15.3741 2.79141C15.3983 2.80368 15.4345 2.81595 15.4587 2.82822C15.4587 2.82822 15.4708 2.84049 15.507 2.85276C15.7849 2.97546 17.283 3.69939 18.914 4.66871C19.8805 5.2454 20.7383 5.82209 21.3303 6.23926C21.8498 6.60736 22.164 6.84049 22.176 6.85276C22.4056 7.02454 22.6351 7.26994 22.8526 7.53988C23.3963 8.25153 23.8433 9.22086 23.9158 9.96933C23.9158 9.9816 23.952 10.2761 23.9883 10.7791C23.9883 10.816 23.9883 10.8405 24.0004 10.8773V10.9509C24.0004 11 24.0124 11.0368 24.0124 11.0859V11.135C24.0124 11.1595 24.0124 11.1963 24.0245 11.2209C24.0245 11.2822 24.0366 11.3436 24.0366 11.4049C24.0366 11.4417 24.0366 11.4785 24.0487 11.5153V11.5399C24.0487 11.589 24.0487 11.6258 24.0608 11.6748V11.773C24.097 12.411 24.1212 13.1718 24.1212 13.9693C24.1212 14.7669 24.097 15.5276 24.0608 16.1656V16.2638C24.0608 16.3129 24.0608 16.3497 24.0487 16.3988V16.4233C24.0487 16.4601 24.0487 16.4969 24.0366 16.5337C24.0366 16.5951 24.0245 16.6564 24.0245 16.7178C24.0245 16.7546 24.0245 16.7791 24.0124 16.8037V16.8528C24.0124 16.9018 24.0004 16.9387 24.0004 16.9877V17.0613C24.0004 17.0982 24.0004 17.135 23.9883 17.1595C23.952 17.6626 23.9158 17.9693 23.9158 17.9693C23.8433 18.7178 23.3963 19.6871 22.8526 20.3988C22.6351 20.681 22.4056 20.9141 22.176 21.0859C22.164 21.0859 21.8498 21.3313 21.3303 21.6994C20.7383 22.1166 19.8685 22.6933 18.914 23.2699C17.283 24.2515 15.7728 24.9632 15.507 25.0859L15.4587 25.1104C15.4345 25.1227 15.3983 25.135 15.3741 25.1472C15.0962 25.2577 14.758 25.3436 14.3834 25.3926C14.2143 25.4172 14.0331 25.4294 13.8518 25.4294H13.6102C12.994 25.4172 12.4141 25.3067 12.0034 25.1104C12.0034 25.1104 11.9188 25.0736 11.7617 25C11.7496 24.9877 11.7255 24.9877 11.7134 24.9755C11.7013 24.9632 11.6892 24.9632 11.6772 24.9509C11.6651 24.9509 11.6651 24.9387 11.653 24.9387C11.6409 24.9387 11.6288 24.9264 11.6167 24.9264C11.6047 24.9141 11.5926 24.9141 11.5684 24.9018H11.5563C10.9402 24.6564 9.78034 24.0675 8.54802 23.3313C6.74787 22.2638 5.78134 21.5153 5.286 21.1472C4.83898 20.816 4.74233 20.5706 4.34363 20.5706H3.41335C3.0509 20.5706 3.0509 20.8896 3.13548 21.0123C3.51 21.5767 3.92078 22.0184 4.37988 22.362C4.44029 22.411 5.91424 23.5153 7.7748 24.6319C7.87145 24.6933 7.96811 24.7546 8.07684 24.8037C9.80451 25.8098 11.2905 26.4969 11.3751 26.546C11.9671 26.816 12.7403 26.9755 13.5619 27H13.731C13.8398 27 13.9485 27 14.0572 26.9877C14.178 26.9877 14.2989 26.9755 14.4197 26.9632C15.0358 26.9018 15.6157 26.7546 16.0748 26.546C16.0748 26.546 16.0869 26.546 16.0869 26.5337C16.2923 26.4356 17.8871 25.6871 19.6631 24.6319C20.6658 24.0307 21.5478 23.4417 22.164 23.0123C22.6956 22.6319 23.0338 22.3865 23.058 22.362C23.348 22.1411 23.6258 21.8589 23.8916 21.5399C24.5682 20.7178 25.1119 19.6258 25.3173 18.6319C25.3173 18.6196 25.3173 18.6074 25.3293 18.5951C25.3414 18.5092 25.3656 18.4233 25.3777 18.3497V18.3129C25.3897 18.2638 25.3897 18.2147 25.3897 18.1779C25.3897 18.1534 25.426 17.8589 25.4622 17.3804V17.3313C25.4864 17.2945 25.4864 17.2577 25.4864 17.2086Z", fill: "url(#paint0_linear_216_1067)" }),
        React.createElement("defs", null,
            React.createElement("linearGradient", { id: "paint0_linear_216_1067", x1: "14.3479", y1: "1", x2: "14.3479", y2: "27.0225", gradientUnits: "userSpaceOnUse" },
                React.createElement("stop", { offset: "0.398", "stop-color": "#1466AC" }),
                React.createElement("stop", { offset: "0.659", "stop-color": "#EF4058" })))));
};
//# sourceMappingURL=SettingsContentAccountForm.js.map