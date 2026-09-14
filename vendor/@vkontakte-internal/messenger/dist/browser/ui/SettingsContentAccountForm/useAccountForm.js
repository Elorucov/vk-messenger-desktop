import React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBrowserEnv, useDebounced, useDispatch, useViewer, } from '../../hooks/misc';
import * as Peer from '../../../core/model/Peer';
import { fromApiValidateProfileInfo, fromApiViewerAccount, fromApiViewerProfileInfo, } from '../../../data/converter/ViewerConverter';
import { fromApiUser } from '../../../data/converter/PeerConverter';
import { IApi } from '../../../data/env/IApi';
import { useSnackbar } from '../../hooks/useSnackbar';
import { Icon28CheckCircleOn, Icon28DismissSubstract } from '@vkontakte/icons';
import { useModal } from '../../hooks/useModal';
import { API_GET_MULTI_FIELDS } from '../../../core/config/config';
import { useApiFetch, useApiFetchMany } from '../../hooks/useApiFetch';
const DEBOUNCED_DELAY = 400;
export const useAccountForm = () => {
    const dispatch = useDispatch();
    const { lang } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const apiFetchMany = useApiFetchMany();
    const snackbar = useSnackbar();
    const editingNotAvailableModal = useModal();
    const changedFieldsRef = useRef(new Set());
    const { viewer: { sex, id }, profileInfo: { firstName, lastName, nickName, bdate, isEsiaVerified }, } = useViewer();
    const [values, setValues] = useState({
        firstName,
        lastName,
        nickName,
        bdate: getBirthdayDate(bdate),
        sex,
        id,
    });
    const [initialValues, setInitialValues] = useState(values);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);
    const [validated, setValidated] = useState(false);
    const { debounced: debouncedValues } = useDebounced(values, DEBOUNCED_DELAY);
    const validateForm = useCallback(async () => {
        try {
            const response = await apiFetch('account.validateProfileInfo', getFormattedProfileInfoParams(values));
            const data = fromApiValidateProfileInfo(response);
            setErrors(data.isError ? getFormattedErrorList(data.fields) : null);
            setValidated(true);
        }
        catch { }
    }, [apiFetch, values]);
    const refreshProfile = useCallback(async () => {
        try {
            const [profileInfoResponse, usersGetResponse, responseMultiAccount] = await apiFetchMany([
                { method: 'account.getProfileInfo', params: {} },
                {
                    method: 'users.get',
                    params: {
                        user_ids: Peer.toRealId(id).toString(),
                        extended: 1,
                    },
                },
                {
                    method: 'account.getMulti',
                    params: {
                        fields: API_GET_MULTI_FIELDS.join(','),
                    },
                },
            ]);
            const profileInfo = fromApiViewerProfileInfo(profileInfoResponse);
            const peerFromApi = usersGetResponse[0];
            const { user = undefined } = peerFromApi ? fromApiUser(peerFromApi) : {};
            const accounts = responseMultiAccount.items.map(fromApiViewerAccount);
            dispatch({
                type: 'UserProfileInfo_Update',
                profileInfo,
                user,
                accounts,
            });
        }
        catch { }
    }, [id, dispatch, apiFetchMany]);
    useEffect(() => {
        if (Boolean(changedFieldsRef.current.size)) {
            validateForm();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedValues]);
    const handleChange = (key) => (value) => {
        setValidated(false);
        const currentValue = value instanceof Date ? value : value?.target.value;
        if (currentValue !== initialValues[key]) {
            changedFieldsRef.current.add(key);
        }
        else {
            changedFieldsRef.current.delete(key);
            setErrors((errors) => ({ ...errors, [key]: '' }));
        }
        setValues((values) => ({ ...values, [key]: currentValue }));
    };
    const handleSubmit = async () => {
        try {
            setLoading(true);
            const response = await apiFetch('account.saveProfileInfo', getFormattedProfileInfoParams(values));
            const isSaved = response.name_request?.status === 'success';
            if (isSaved) {
                await refreshProfile();
                snackbar({
                    before: (React.createElement(Icon28CheckCircleOn, { color: "var(--vkui--color_icon_accent)" })),
                    message: lang.use('me_success_save_profile_info'),
                });
                setInitialValues(values);
                changedFieldsRef.current.clear();
            }
            else {
                const message = response.name_request?.lang ??
                    lang.use('me_success_save_profile_info_error');
                snackbar({
                    before: React.createElement(Icon28DismissSubstract, null),
                    message,
                });
            }
        }
        catch (e) {
            if (e instanceof IApi.RequestError) {
                // todo код ошибки константой
                if (e.apiError.error_code === 989) {
                    editingNotAvailableModal.open();
                    return;
                }
                if (typeof e.apiError.error_text === 'string') {
                    snackbar({
                        before: React.createElement(Icon28DismissSubstract, null),
                        message: e.apiError.error_text,
                    });
                }
            }
        }
        finally {
            setLoading(false);
        }
    };
    return {
        values,
        errors,
        loading,
        disabled: Boolean(errors) || !changedFieldsRef.current.size || !validated,
        isEsiaVerified,
        editingNotAvailableModal,
        handleChange,
        handleSubmit,
    };
};
function getFormattedProfileInfoParams({ firstName, lastName, nickName, bdate, sex, }) {
    const currentDay = bdate?.getDate();
    const currentMonth = bdate && bdate.getMonth() + 1;
    const currentYear = bdate?.getFullYear();
    return {
        first_name: firstName,
        last_name: lastName,
        nick_name: nickName,
        bdate: `${currentDay}.${currentMonth}.${currentYear}`,
        sex: sex === 'female' ? 1 : 2,
    };
}
function getFormattedErrorList(fields) {
    if (!fields?.length) {
        return null;
    }
    const fieldsMap = {
        first_name: 'firstName',
        last_name: 'lastName',
        nick_name: 'nickName',
    };
    return fields?.reduce((acc, field) => {
        const fieldName = fieldsMap[field.name] || field.name;
        acc[fieldName] = field.text ?? '';
        return acc;
    }, {});
}
function getBirthdayDate(bdate) {
    if (!bdate) {
        return;
    }
    const [day, month, year] = bdate.split('.').map(Number);
    if (day && month && year) {
        return new Date(year, month - 1, day);
    }
    return;
}
//# sourceMappingURL=useAccountForm.js.map