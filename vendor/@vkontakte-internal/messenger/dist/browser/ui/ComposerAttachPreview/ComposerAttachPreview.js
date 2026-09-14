import '../../ui/ComposerAttachPreview/ComposerAttachPreview.css';
import React from 'react';
import * as Attach from '../../../core/model/Attach';
import { RestrictionIcon } from '../../ui/RestrictionIcon/RestrictionIcon';
export const ComposerAttachPreview = ({ media, isCompactView, }) => {
    const mediaSource = getMediaSource(media, isCompactView ? 68 : 88);
    const restriction = (media.kind === 'Photo' || media.kind === 'Video') && media.restriction;
    return (React.createElement("div", { className: "ComposerAttachPreview" }, restriction ? (React.createElement("div", { className: "ComposerAttachPreview__restiction" },
        React.createElement(RestrictionIcon, { small: true, name: restriction.iconName, disclaimerType: restriction.disclaimerType }))) : (mediaSource && (React.createElement("img", { ...mediaSource, alt: "", className: "ComposerAttachPreview__img" })))));
};
function getMediaSource(media, photoSize) {
    const { base, dense } = getMediaPreview(media, photoSize);
    if (!base && !dense) {
        return null;
    }
    if (!base || !dense) {
        return {
            src: (base || dense)?.url || '',
        };
    }
    return {
        srcSet: `${base.url}, ${dense.url} 2x`,
        src: dense.url,
    };
}
function getMediaPreview(media, photoSize) {
    /**
     * Если файл был загружен локально, то у него будет локальная картинка.
     * Тогда сразу отдаем ее.
     */
    if (media.kind === 'OptimisticPhoto' ||
        media.kind === 'OptimisticDoc' ||
        media.kind === 'OptimisticVideo') {
        return {
            base: media.image,
        };
    }
    /**
     * Gif-изображения загружаются как документы,
     * показывать их как фотографии (статично) кажется
     * некорректным, из-за чего по-умолчанию отображаем
     * их анимированными, т.е. подставляем в url адрес gif,
     * а не статичного кадра изображения из gif
     */
    if (media.kind === 'Doc' && media.ext === 'gif') {
        return {
            base: {
                width: photoSize,
                height: photoSize,
                url: media.url,
            },
        };
    }
    if (media.kind === 'Photo' || media.kind === 'Doc') {
        return {
            base: Attach.preview(media, photoSize),
            dense: Attach.preview(media, photoSize * 2),
        };
    }
    return {
        base: Attach.preview(media, photoSize),
        dense: Attach.preview(media, photoSize * 2),
    };
}
//# sourceMappingURL=ComposerAttachPreview.js.map