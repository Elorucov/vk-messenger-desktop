import * as React from 'react';
import { sanitizeUrl } from '../helpers';
const MINI_APP = 'mini_app';
const PROFILE = 'profile';
const GROUP = 'group';
const INLINE = 'inline';
let globalSvgFilterId = 0;
const getDefaultSizeByImageType = (imageType) => {
    if (imageType === 'circle') {
        return {
            width: '56px',
            height: '56px',
        };
    }
    if (imageType === 'app') {
        return {
            width: '56px',
            height: '56px',
        };
    }
    if (imageType === 'square') {
        return {
            width: '56px',
            height: '56px',
        };
    }
    if (imageType === 'poster') {
        return {
            width: '56px',
            height: '76px',
        };
    }
    if (imageType === 'tv') {
        return {
            width: '48px',
            height: '36px',
        };
    }
    return { width: '', height: '' };
};
function findObjectById(items, id) {
    // TODO: remove all find() methods
    return items.find((item, index) => {
        return /* @elephizeTypecast int */ id === /* @elephizeTypecast int */ item.id;
    });
}
function findInlineImageItem(items) {
    // TODO: Эта функция должна быть умнее наверное,
    // загружать нужные картинки в зависимости от dpi или размеров.
    // При этом возможно всегда лучше выбрать отдну максимально большую для DPI,
    // что бы браузер не рендерил несколько разных, итд.
    let start = items.length;
    let item;
    for (let i = items.length; i > 0; i--) {
        item = items[start - 1];
        if (item && item.url) {
            break;
        }
    }
    // @ts-ignore
    return /* @elephizeTypecast array */ item;
}
function getImageItemAttr(items, priorSize, imageType) {
    const image = findInlineImageItem(/* @elephizeTypecast array */ items);
    const defaultSize = getDefaultSizeByImageType(imageType);
    const src = image && image.url;
    const width = priorSize.widthPrior || defaultSize.width;
    const height = priorSize.heightPrior || defaultSize.height;
    return {
        style: {
            height,
            width,
        },
        src,
    };
}
function getImageBlockAttr(image, meta, priorSize, imageType) {
    let src = '';
    const defaultSize = getDefaultSizeByImageType(imageType);
    let height = priorSize.heightPrior || defaultSize.height;
    let width = priorSize.widthPrior || defaultSize.width;
    if (image.type === MINI_APP) {
        const miniApps = [...(meta.mini_apps || []), ...(meta.games || [])];
        const miniApp = miniApps.length && findObjectById(
        /* @elephizeTypecast array */ miniApps, 
        /* @elephizeTypecast float */ image.object_id);
        if (miniApp && miniApp.icon_139) {
            src = miniApp.icon_139;
        }
        // @ts-ignore
        if (miniApp && miniApp.icon_128) {
            // @ts-ignore
            src = miniApp.icon_128;
        }
    }
    else if (image.type === PROFILE) {
        const profile = meta.profiles && findObjectById(/* @elephizeTypecast array */ meta.profiles, /* @elephizeTypecast float */ image.object_id);
        if (profile && profile.photo_200) {
            src = profile.photo_200;
        }
    }
    else if (image.type === GROUP) {
        const group = meta.groups && findObjectById(/* @elephizeTypecast array */ meta.groups, /* @elephizeTypecast float */ image.object_id);
        if (group && group.photo_200) {
            src = group.photo_200;
        }
    }
    else if (image.type === INLINE) {
        // TODO: maybe use getImageItemAttr here
        const imageItem = findInlineImageItem(/* @elephizeTypecast array */ image.items);
        if (imageItem) {
            src = imageItem.url;
            height = priorSize.heightPrior || defaultSize.height;
            width = priorSize.widthPrior || defaultSize.width;
        }
    }
    return {
        style: {
            height,
            width,
        },
        src,
    };
}
const getImageAttr = (images, meta, priorSize, imageType) => {
    let image = images[images.length - 1];
    // Это Image
    if (image.hasOwnProperty('type')) {
        return getImageBlockAttr(/* @elephizeTypecast array */ image, meta, priorSize, imageType);
    }
    // Это Icon
    return getImageItemAttr(/* @elephizeTypecast array */ images, priorSize, imageType);
};
// @elephizeTarget
const ImageContainer = ({ children, type, vAlign, width, height }) => {
    const classNames = ['SAKWidget__image'];
    if (type) {
        classNames.push(`SAKWidget__image--type-${type}`);
    }
    if (vAlign) {
        classNames.push(`SAKWidget__image--valign-${ /* @elephizeTypecast string */vAlign}`);
    }
    return (React.createElement("div", { style: { width, height }, className: classNames.join(' ') }, children));
};
// @elephizeTarget
function IconSVGColor({ className, src, style }) {
    // Нам на самом деле не нужно столько много фильтров (на каждую иконку),
    // так как он одинаковый и зависит от currentColor.
    // Но так как мы ничего не знаем о SSR окружение и тем более,
    // что это может быть elephize -- нам нужно что бы оно отрендерилось
    // максимально просто без всяких "поместить svg фильтр в body".
    // В итоге, что бы фильтры не конфликтовали, у них должен быть уникальный #id.
    // Тут можно брать либо uid из виджета, либо сами генерировать его.
    // К сожалению, uid из виджета просто так не взять --
    // elephize не может в context, а прокидывать uid в каждый Image это такое.
    // Правда, elephize не может и в useMemo(), но судя по --
    // https://github.com/VKCOM/elephize/issues/126 --
    // его будет достаточно легко научить. Так что -- кастомный id и useMemo().
    const increment = window._elephizeIsServer ?
        globalSvgFilterId++ :
        React.useMemo(() => globalSvgFilterId++, []);
    const id = `sakWidgetFilter${increment}`;
    // Elephize неправильно преобразует название реактовского пропса xlinkHref
    const imageProps = { 'xlink:href': src };
    return (React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", version: "1.1", className: className, width: style.width, height: style.height },
        React.createElement("defs", null,
            React.createElement("filter", { id: id },
                React.createElement("feFlood", { result: "flood", className: "SAKWidget__svgFlood" }),
                React.createElement("feComposite", { in: "flood", in2: "SourceGraphic", operator: "in" }))),
        React.createElement("image", Object.assign({ width: "100%", height: "100%", filter: `url(#${id})` }, imageProps))));
}
// @elephizeTarget
export const Image = ({ /* @elephizeTypecast array */ styles, items, meta, widthPrior, heightPrior, isIcon, noContainer, className = '' }) => {
    const imageStyles = styles ? styles.image : {};
    const newStyles = imageStyles || {};
    const imageType = /* @elephizeTypecast string */ newStyles.type || '';
    const color = /* @elephizeTypecast string */ newStyles.color || '';
    const vAlign = /* @elephizeTypecast string */ newStyles.vertical_align || '';
    const props = getImageAttr(items, meta, { widthPrior, heightPrior }, /* @elephizeTypecast string */ imageType);
    if (props.src) {
        props.src = sanitizeUrl(/* @elephizeTypecast string */ props.src);
    }
    // TODO fix item selection
    // TODO: add action to Image when needed
    // const action = items[0] ? (items[0] as WidgetsKitImageBlock).action : undefined;
    let classNames = [];
    if (className) {
        classNames.push(className);
    }
    if (isIcon && color) {
        classNames.push('SAKWidget__svgTag');
        classNames.push(`SAKWidget__svgTag--color-${ /* @elephizeTypecast string */color}`);
    }
    else {
        classNames.push('SAKWidget__imgTag');
        if (imageType) {
            classNames.push(`SAKWidget__imgTag--type-${ /* @elephizeTypecast string */imageType}`);
        }
    }
    const tag = (isIcon && color) ?
        React.createElement(IconSVGColor, Object.assign({ className: classNames.join(' ') }, props)) :
        React.createElement("img", Object.assign({ className: classNames.join(' ') }, props));
    if (noContainer) {
        return tag;
    }
    return (React.createElement(ImageContainer, { type: /* @elephizeTypecast string */ imageType, vAlign: vAlign, width: props.style.width, height: props.style.height }, tag));
};
//# sourceMappingURL=Image.js.map