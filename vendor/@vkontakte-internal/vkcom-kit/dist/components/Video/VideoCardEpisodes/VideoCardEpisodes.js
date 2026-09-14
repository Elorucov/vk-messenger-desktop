import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"Text":["Adopted",{"className":1}]} */
import { memo, useState } from 'react';
import { Accordion, HorizontalScroll, Spacing, Text } from '../../Adopted';
import { TextClamp } from '../../TextClamp/TextClamp';
import { VideoCardEpisode } from './VideoCardEpisode/VideoCardEpisode';
import { VideoCardEpisodeThumb } from './VideoCardEpisodeThumb/VideoCardEpisodeThumb';
import styles from './VideoCardEpisodes.module.css';
const MAX_SIZE = 48;
export const VideoCardEpisodes = memo(({ title, episodes, defaultExpanded, thumbDataTitle, defaultSelectedEpisodeIndex = 0, onClickEpisode, onClickAccordion, disabledAccordion, }) => {
    const [isOpen, setIsOpen] = useState(!!defaultExpanded);
    const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState(defaultSelectedEpisodeIndex);
    const selectedEpisode = episodes[selectedEpisodeIndex];
    const showAccordionContent = Boolean(!disabledAccordion || defaultExpanded);
    const handleToggleAccordion = (value) => {
        setIsOpen(value);
    };
    const handleClickEpisode = (event, time) => {
        const episodeIndex = episodes.findIndex((ep) => ep.time === time);
        setSelectedEpisodeIndex(episodeIndex);
        onClickEpisode?.(event, time);
    };
    const handleClickAccordion = (event) => {
        onClickAccordion?.(event, !disabledAccordion && !isOpen);
    };
    return (_jsx("div", { className: styles.episodes, children: _jsxs(Accordion, { onChange: handleToggleAccordion, disabled: disabledAccordion, defaultExpanded: defaultExpanded, children: [_jsx(Accordion.Summary, { onClick: handleClickAccordion, before: !isOpen && thumbDataTitle ? (_jsx(VideoCardEpisodeThumb, { thumbData: { ...thumbDataTitle, maxSize: MAX_SIZE } })) : undefined, "data-testid": "accordion-summary-episodes", children: _jsxs(TextClamp, { lines: 1, TypographyComponent: Text, Component: "p", weight: "2", children: [title, !isOpen && (_jsxs(Text, { className: styles.text, weight: "3", children: [' ', `· ${selectedEpisode.text}`] }))] }) }), showAccordionContent && (_jsxs(Accordion.Content, { children: [_jsx(HorizontalScroll, { inline: true, showArrows: false, scrollOnAnyWheel: true, children: episodes.map(({ text, thumbData, time }) => (_jsx(VideoCardEpisode, { active: selectedEpisode.time === time, onClick: handleClickEpisode, text: text, thumbData: thumbData, time: time }, time))) }), isOpen && _jsx(Spacing, { size: "xs" })] }))] }) }));
});
VideoCardEpisodes.displayName = 'VideoCardEpisodes';
//# sourceMappingURL=VideoCardEpisodes.js.map