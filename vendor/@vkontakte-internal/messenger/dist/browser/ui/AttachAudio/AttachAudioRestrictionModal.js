import { Icon56PensiveFace } from '@vkontakte-internal/icons-private';
import { useBrowserEnv } from '../../hooks/misc';
import React, { useCallback, useMemo } from 'react';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { useRouter } from '../../ui/Router/Router';
export const AttachAudioRestrictionModal = ({ audio, onClose }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ModalInterface, { onClose: onClose, closeLabel: lang.use('me_close'), title: lang.use('me_voice_recording_error_title') },
        React.createElement(AudioRestrictionContainer, { audio: audio })));
};
const AudioRestrictionContainer = ({ audio }) => {
    const { lang } = useBrowserEnv();
    const { contentRestricted } = audio;
    const { title, text } = (contentRestricted && restrictionDetails.get(contentRestricted)) || {};
    return (React.createElement("div", { className: "AttachAudio__restrictionInfoContainer" },
        React.createElement(Icon56PensiveFace, null),
        React.createElement("div", { className: "AttachAudio__restrictionInfoTitle" }, title && lang.use(title)),
        React.createElement("div", { className: "AttachAudio__restrictionInfoText" }, text && lang.use(text))));
};
export const useAudioRestriction = () => {
    const { navigate, runtimeRoute } = useRouter();
    const audioRestriction = useMemo(() => runtimeRoute?.kind === 'AudioRestrictionRuntimeRoute' ? (React.createElement(AudioRestrictionContainer, { audio: runtimeRoute.audio })) : null, [runtimeRoute]);
    const handleAudioRestrictionClose = useCallback(() => navigate({ kind: 'EmptyRuntimeRoute' }), [navigate]);
    return { audioRestriction, handleAudioRestrictionClose };
};
const restrictionDetails = new Map([
    [
        1,
        {
            title: 'me_audio_restriction_title_claim',
            text: 'me_audio_restriction_text_claim',
        },
    ],
    [
        2,
        {
            title: 'me_audio_restriction_title_geo',
            text: 'me_audio_restriction_text_geo',
        },
    ],
    [
        3,
        {
            title: 'me_audio_restriction_title_subscription',
        },
    ],
    [
        4,
        {
            title: 'me_audio_restriction_title_claim',
            text: 'me_audio_restriction_text_claim',
        },
    ],
    [
        5,
        {
            title: 'me_audio_restriction_title_future',
            text: 'me_audio_restriction_text_future',
        },
    ],
    [
        6,
        {
            title: 'me_audio_restriction_title_country',
            text: 'me_audio_restriction_text_country',
        },
    ],
    [
        7,
        {
            title: 'me_audio_restriction_title_rules',
            text: 'me_audio_restriction_text_rules',
        },
    ],
    [
        8,
        {
            title: 'me_audio_restriction_title_suspend',
            text: 'me_audio_restriction_text_suspend',
        },
    ],
    [
        9,
        {
            title: 'me_audio_restriction_title_update',
        },
    ],
    [
        10,
        {
            title: 'me_audio_restriction_title_claim',
            text: 'me_audio_restriction_text_warner_non_retail',
        },
    ],
    [
        12,
        {
            title: 'me_audio_restriction_title_experiment',
            text: 'me_audio_restriction_text_experiment',
        },
    ],
    [
        13,
        {
            title: 'me_audio_restriction_title_error',
            text: 'me_audio_restriction_text_error',
        },
    ],
    [
        14,
        {
            title: 'me_audio_restriction_title_claim',
            text: 'me_audio_restriction_text_jam',
        },
    ],
]);
//# sourceMappingURL=AttachAudioRestrictionModal.js.map