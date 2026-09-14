import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { DropdownActionSheet, SeparatorSpacing, VoiceRoomButton, Link, Text, } from '@vkontakte-internal/vkcom-kit';
import { Icon20ArrowUpOutline, Icon20ArrowUpRectangleOutline, Icon20CopyOutline, Icon20GearOutline, Icon20PictureOutline, Icon20VideoOutline, Icon20VideoSquareOutline, Icon20VmojiOutline, Icon20RecorderTapeOutline, Icon24Settings, Icon20UserSquareOutline, Icon20SubtitlesOutline, } from '@vkontakte/icons';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { useScreenShare } from '../../../hooks/useScreenShare';
import { getVoiceRoomJoinLink, getVoiceRoomIsAudioMode, getIsMyScreenShare, getVoiceRoomScreenShareOwner, } from '../selectors';
import { getMyMediaSettings } from '../../../selectors';
import { useToggleMediaSettingsModal } from '../../../hooks/useToggleMediaSettingsModal';
import { useControlsShown } from './useControlsShown';
import { useLang } from '../../../hooks/useLang';
import { safeWriteClipboard } from '../../../utils/safeWriteClipboard';
import { useTypedDispatch } from '../../../hooks/useTypedDispatch';
import { toggleModal } from '../../../actions';
import { ModalType } from '@vkontakte-internal/calls-core';
import { useState } from 'react';
import { useConfig } from '../../../services/config';
import { useVoiceRoomMenuModel, VoiceRoomMenuModelProvider } from './VoiceRoomMenuModel';
const VoiceRoomMenu = observer(function VoiceRoomMenu() {
    const { isSubtitlesFeatureEnabled, toggleSubtitles, toggleVmoji, getRecordActionSettings, onOpenWatchTogetherFeature, isSubtitlesEnabled, watchTogetherOwner, isMeCanManageWatchTogether: canManageWatchTogether, } = useVoiceRoomMenuModel();
    const [isShown, setIsShown] = useState(false);
    const dispatch = useTypedDispatch();
    const { getLang } = useLang();
    const { enableCallFeaturesInSpaces } = useConfig();
    const isAudioMode = useTypedSelector(getVoiceRoomIsAudioMode);
    const { isAnimojiEnabled } = useTypedSelector(getMyMediaSettings);
    const screenShareOwner = useTypedSelector(getVoiceRoomScreenShareOwner);
    const isMyScreenShare = useTypedSelector(getIsMyScreenShare);
    const joinLink = useTypedSelector(getVoiceRoomJoinLink);
    const { handleStartScreenShare, handleStopScreenShare, handleStartFastScreenShare } = useScreenShare();
    const recordActionSettings = getRecordActionSettings();
    const onOpenVirtualBackgroundSettings = () => {
        dispatch(toggleModal(ModalType.VIRUTAL_BACKGROUND));
    };
    const { isScreenShareStartShown, isScreenShareStopShown, isWatchTogetherShown, isVmojiShown, isCopyJoinLinkShown, isVirtualBackgroundShown, } = useControlsShown();
    const onCopyCallLink = () => {
        if (joinLink) {
            safeWriteClipboard(joinLink);
        }
    };
    const onOpenSettings = useToggleMediaSettingsModal();
    return (_jsx(DropdownActionSheet, { onShownChange: setIsShown, trigger: "click", placement: "top-start", content: _jsxs(_Fragment, { children: [isScreenShareStartShown && (_jsx(DropdownActionSheet, { trigger: "hover", placement: "left-start", width: 316, usePortal: false, content: _jsxs(_Fragment, { children: [_jsx(DropdownActionSheet.Item, { multiline: true, subtitle: getLang('voicerooms_screen_share_regular_action_description'), before: _jsx(Icon20PictureOutline, {}), onClick: handleStartScreenShare, children: getLang('voicerooms_screen_share_regular_action') }), _jsx(DropdownActionSheet.Item, { multiline: true, subtitle: getLang('voicerooms_screen_share_fast_action_description'), before: _jsx(Icon20VideoOutline, {}), onClick: handleStartFastScreenShare, children: getLang('voicerooms_screen_share_fast_action') })] }), children: _jsx(DropdownActionSheet.Item, { disabled: Boolean((screenShareOwner && !isMyScreenShare) || watchTogetherOwner), before: _jsx(Icon20ArrowUpRectangleOutline, {}), keepOpen: true, children: getLang('voicerooms_screen_share_action') }) })), isScreenShareStopShown && (_jsx(DropdownActionSheet.Item, { before: _jsx(Icon20ArrowUpOutline, {}), onClick: handleStopScreenShare, children: getLang('voicerooms_screen_share_stop_action') })), isWatchTogetherShown && (_jsx(DropdownActionSheet.Item, { disabled: Boolean(!canManageWatchTogether || screenShareOwner), before: _jsx(Icon20VideoSquareOutline, {}), onClick: onOpenWatchTogetherFeature, children: getLang('voicerooms_watch_together_action') })), recordActionSettings && (_jsx(DropdownActionSheet.Item, { before: _jsx(Icon20RecorderTapeOutline, {}), disabled: recordActionSettings.isDisabled, onClick: recordActionSettings.onToggle, type: recordActionSettings.canBeStopped ? 'destructive' : undefined, children: recordActionSettings.canBeStopped
                        ? getLang('voicerooms_stop_record_action')
                        : getLang('voicerooms_start_record_action') })), (isScreenShareStartShown ||
                    isScreenShareStopShown ||
                    isWatchTogetherShown ||
                    recordActionSettings) && _jsx(SeparatorSpacing, {}), isVmojiShown && (_jsx(DropdownActionSheet.Item, { before: _jsx(Icon20VmojiOutline, {}), after: isAnimojiEnabled
                        ? getLang('voicerooms_vmoji_action_active')
                        : getLang('voicerooms_vmoji_action_not_active'), onClick: toggleVmoji, children: getLang('voicerooms_vmoji_action') })), isVirtualBackgroundShown && (_jsx(DropdownActionSheet.Item, { before: _jsx(Icon20UserSquareOutline, {}), onClick: onOpenVirtualBackgroundSettings, children: getLang('voicerooms_virtual_background_action') })), _jsx(DropdownActionSheet.Item, { before: _jsx(Icon20GearOutline, {}), onClick: onOpenSettings, children: isAudioMode
                        ? getLang('voicerooms_audio_settings_action')
                        : getLang('voicerooms_video_and_audio_settings_action') }), isCopyJoinLinkShown && (_jsx(DropdownActionSheet.Item, { before: _jsx(Icon20CopyOutline, {}), onClick: onCopyCallLink, children: getLang('voicerooms_copy_link_action') })), enableCallFeaturesInSpaces && isSubtitlesFeatureEnabled && (_jsx(DropdownActionSheet.Item, { before: _jsx(Icon20SubtitlesOutline, {}), 
                    // Оставляем именно в таком формате для корректного тайпчека
                    onClick: () => toggleSubtitles(), after: _jsx(Link, { hasHover: false, "aria-hidden": true, children: _jsx(Text, { children: isSubtitlesEnabled ? getLang('calls_plural_enabled') : getLang('calls_plural_disabled') }) }), children: getLang('calls_call_menu_enable_subtitles') }))] }), children: _jsx("div", { children: _jsx(VoiceRoomButton, { tooltip: !isShown && getLang('calls_settings'), mode: "secondary", children: _jsx(Icon24Settings, {}) }) }) }));
});
export const VoiceRoomMenuWidget = createWidget(VoiceRoomMenuModelProvider, VoiceRoomMenu);
//# sourceMappingURL=VoiceRoomMenuWidget.js.map