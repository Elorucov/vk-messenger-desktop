import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":7,"dangerouslySetInnerHTML":2}],"input":["global",{"className":1}]} */
import { useRef, useMemo } from 'react';
import { useFileReader } from './hooks/useFileReader';
import { useLang } from '../../hooks/useLang';
import { Button } from '@vkontakte-internal/vkcom-kit';
export const UploadBackgroundPhoto = ({ onSubmit, loading }) => {
    const { getLang } = useLang();
    const $inputUpload = useRef(null);
    const { onClick, error } = useFileReader({
        $inputEl: $inputUpload,
        onSubmit,
    });
    /** сообщение об ошибке, отображаемое в оранжевом предупреждении */
    const errorMessage = useMemo(() => {
        return `${getLang('profile_oph_err_size')}`
            .replace('{sorry}', `<b>${getLang('global_sorry_error')}</b>`)
            .replace('{min}', '200')
            .replace('{max}', '7000');
    }, []);
    return (_jsxs("div", { className: "UploadBackgroundPhoto", children: [_jsx("input", { ref: $inputUpload, type: "file", className: "UploadBackgroundPhoto__upload" }), error && (_jsxs("div", { className: "UploadBackgroundPhoto__error", children: [_jsx("div", { className: "UploadBackgroundPhoto__error__left" }), _jsx("div", { className: "UploadBackgroundPhoto__error__right", dangerouslySetInnerHTML: { __html: errorMessage } })] })), _jsx("div", { className: "UploadBackgroundPhoto__description", dangerouslySetInnerHTML: {
                    __html: getLang('calls_you_can_upload_description'),
                } }), !loading && (_jsx("div", { className: "UploadBackgroundPhoto__button", children: _jsx(Button, { size: "m", mode: "primary", onClick: onClick, children: getLang('calls_choose_file') }) })), loading && _jsx("div", { className: "UploadBackgroundPhoto__progress" })] }));
};
//# sourceMappingURL=UploadBackgroundPhoto.js.map