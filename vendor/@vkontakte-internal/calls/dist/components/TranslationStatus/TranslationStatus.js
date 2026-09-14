import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { classNames as cn } from '@vkontakte/vkjs';
import { Icon20RecordingCircleFill, Icon16View, Icon12Dropdown } from '@vkontakte/icons';
import { IconLiveText20h } from '@vkontakte-internal/icons-private';
import { useLang } from '../../hooks/useLang';
import { AppearanceProvider, DropdownActionSheet, AppRootProvider, Button, TextTooltip, VisuallyHidden, } from '@vkontakte-internal/vkcom-kit';
import { DialogConfirm } from '../DialogConfirm/DialogConfirm';
/** компонент для показа статуса __трансляции__ звонка */
export const TranslationStatus = ({ translationTimer, viewersCount, isLiveIndicatorOff = false, actions = [], tooltipText = '', onTranslationPublish, isOpenStartNowModal, onOpenStartNowModal, onCloseStartNowModal, isCanManage, }) => {
    const { getLang } = useLang();
    const translationIndicatorClass = cn({
        'TranslationStatus__translationIndicator': true,
        'TranslationStatus__translationIndicator--disabled': isLiveIndicatorOff,
    });
    const hasDropdown = actions?.length > 0;
    const timerClassNames = cn({
        'TranslationStatus__translationTimer': true,
        'TranslationStatus__translationTimer--hasIndicator': !isLiveIndicatorOff,
    });
    const getStatus = () => {
        return (_jsxs("div", { className: "TranslationStatus__translation", role: "button", "aria-label": getLang('calls_translation_menu_title'), children: [_jsx(IconLiveText20h, { className: translationIndicatorClass }), _jsxs(_Fragment, { children: [!!translationTimer && _jsx("div", { className: timerClassNames, children: translationTimer }), !isLiveIndicatorOff && viewersCount !== undefined && (_jsxs("div", { className: "TranslationStatus__translationViewersCount", children: [_jsx(Icon16View, {}), _jsx("div", { className: "TranslationStatus__translationViewersCountNumber", children: viewersCount })] })), hasDropdown && (_jsx("div", { className: "TranslationStatus__translationDropdown", children: _jsx(Icon12Dropdown, {}) }))] })] }, "translation"));
    };
    let status = getStatus();
    if (hasDropdown) {
        const content = (_jsx(_Fragment, { children: actions?.map((action, index) => (_jsx(DropdownActionSheet.Item, { "data-testid": `calls_translation_status_item_${index}`, before: action.before, onClick: action.handleClick, children: action.text }, action.text))) }));
        status = (_jsx(DropdownActionSheet, { "data-testid": "calls_translation_status_menu_root", trigger: "hover", content: content, children: status }));
    }
    else if (tooltipText) {
        status = _jsx(TextTooltip, { text: tooltipText, children: status });
    }
    return (_jsx(AppRootProvider, { children: _jsxs("div", { className: cn('TranslationStatus', isLiveIndicatorOff && 'TranslationStatus_withPlanning'), children: [status, ' ', isLiveIndicatorOff && isCanManage && (_jsx(AppearanceProvider, { value: "dark", children: _jsx(Button, { onClick: onOpenStartNowModal, mode: "primary", size: "s", children: getLang('calls_broadcast_planned_start_now') }) })), isOpenStartNowModal && (_jsx(DialogConfirm, { onClose: onCloseStartNowModal, title: getLang('calls_broadcast_planned_start_modal_title'), description: getLang('calls_broadcast_planned_start_modal_content'), cancelTitle: getLang('calls_cancel'), submitTitle: getLang('calls_broadcast_planned_start_modal_start_button'), onSubmit: onTranslationPublish }))] }) }));
};
/** компонент для показа статуса __записи__ звонка */
export const TranslationStatusRecord = ({ translationTimer, isMeAuthor, recordStartTimeMs, recordAuthorDisplayName, onStopRecord, isCanStopRecord, }) => {
    const { getLang } = useLang();
    /** если прошло 5 секунд с момента начала записи звонка */
    const isFiveSecondsPassed = Date.now() - (recordStartTimeMs || 0) > 5000;
    /** 12:05 */
    const isShowTimer = !!translationTimer && isFiveSecondsPassed;
    /** Идёт запись звонка */
    const isShowTitle = !!translationTimer && !isFiveSecondsPassed;
    /** Михаил Л. записывает звонок */
    const isShowAuthor = !translationTimer && !isMeAuthor && !!recordAuthorDisplayName;
    /** показываем ли кнопку "Завершить" */
    const isShowEndRecord = !!(isMeAuthor || isCanStopRecord);
    return (_jsx("div", { className: cn('TranslationStatus', 'TranslationStatus--is-record'), children: _jsxs("div", { className: cn({
                'TranslationStatus__translation': true,
                'TranslationStatus__translation--is-not-author': !isShowEndRecord,
            }), children: [_jsx(Icon20RecordingCircleFill, { fill: "#FF3347", width: 16, height: 16 }), _jsxs("div", { className: "TranslationStatus__translationTimer", children: [isShowTimer && translationTimer, isShowTitle && getLang('calls_recording_in_progress'), isShowAuthor && getLang('calls_name_is_recording').replace('{name}', recordAuthorDisplayName)] }), isShowEndRecord && (_jsxs(Button, { "data-testid": "calls_record_stop_button", onClick: onStopRecord, appearance: "negative", mode: "tertiary", size: "s", children: [_jsx("span", { "aria-hidden": true, children: getLang('calls_end_recording') }), _jsx(VisuallyHidden, { children: getLang('calls_record_stop_confirmation') })] }))] }, "translation") }));
};
//# sourceMappingURL=TranslationStatus.js.map