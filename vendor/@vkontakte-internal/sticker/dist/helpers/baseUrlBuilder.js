import { DEFAULT_PIXEL_RATIO, PIXEL_RATIO } from '../utils/pixelRatio';
export var Theme;
(function (Theme) {
    Theme["LIGHT"] = "light";
    Theme["DARK"] = "dark";
})(Theme || (Theme = {}));
export var FormatModifier;
(function (FormatModifier) {
    FormatModifier["PNG"] = "png";
})(FormatModifier || (FormatModifier = {}));
export var BaseUrlImageVariant;
(function (BaseUrlImageVariant) {
    BaseUrlImageVariant["SQUARE"] = "square";
})(BaseUrlImageVariant || (BaseUrlImageVariant = {}));
/**
 * {@link https://confluence.mvk.com/display/IVAS/IVAS%3A+Stickers%3A+Base+URL BaseURL image builder}
 */
export class BaseUrlBuilder {
    static { this.DEFAULT_FORMAT = FormatModifier.PNG; }
    constructor({ size, theme, format, upscale, imageId, defaultConfigId, images, configs, configContext, }) {
        this.format = BaseUrlBuilder.DEFAULT_FORMAT;
        this.upscale = true;
        this.size = size;
        this.theme = theme || Theme.LIGHT;
        this.format = format || FormatModifier.PNG;
        this.imageId = imageId;
        this.defaultConfigId = defaultConfigId;
        if (upscale !== undefined) {
            this.upscale = upscale;
        }
        if (images?.[0]?.theme) {
            images = images.sort(({ theme: a }, { theme: b }) => Number(a === theme) - Number(b === theme));
        }
        this.images = images;
        this.configs = configs;
        this.configContext = configContext;
    }
    /**
     * Установить ожидаемый размер изображения
     */
    setSize(size) {
        this.size = size;
        return this;
    }
    /**
     * Установить ожидаемую тему изображения
     */
    setTheme(theme) {
        this.theme = theme;
        return this;
    }
    /**
     * Установить ожидаемое расширение изображения
     */
    setFormat(format) {
        this.format = format;
        return this;
    }
    /**
     * Установить ID изображения для сборки
     */
    setImageId(imageId) {
        this.imageId = imageId;
        return this;
    }
    /**
     * Установить ID конфига по-умолчанию для сборки изображения
     */
    setDefaultConfigId(defaultConfigId) {
        this.defaultConfigId = defaultConfigId;
        return this;
    }
    /**
     * Установить список изображения для старого алгоритма поиска
     *
     * @deprecated {@link https://confluence.mvk.com/display/IVAS/IVAS%3A+Stickers%3A+Base+URL Используйте BaseURL конфиги}
     */
    setImages(images) {
        this.images = images;
        return this;
    }
    /**
     * Установить {@link https://confluence.mvk.com/display/IVAS/IVAS%3A+Stickers%3A+Base+URL BaseURL} конфиги для сборки изображения
     */
    setConfigs(configs) {
        this.configs = configs;
        return this;
    }
    /**
     * Установить {@link https://confluence.mvk.com/display/IVAS/IVAS%3A+Stickers%3A+Base+URL BaseURL} данные для выборки нужного конфига из списка доступных
     */
    setConfigContext(configContext) {
        this.configContext = configContext;
        return this;
    }
    /**
     * Собрать ссылку на изображение
     */
    build() {
        if (this.images) {
            return this.findImage();
        }
        if (this.configContext || this.configs?.length) {
            return this.buildBaseUrl();
        }
        return;
    }
    /**
     * Собрать ссылку на изображение используя старый формат
     */
    static build({ config, variant, size, retinaSize, format = BaseUrlBuilder.DEFAULT_FORMAT, }) {
        if (!config) {
            return '';
        }
        const { base_url, version } = config;
        if (retinaSize && PIXEL_RATIO > DEFAULT_PIXEL_RATIO) {
            size = retinaSize;
        }
        const sizeModifier = size > 1 ? `_${size}x` : '';
        const versionModifier = version !== undefined ? `?${version}` : '';
        return `${base_url}/${variant}${sizeModifier}.${format}${versionModifier}`;
    }
    /**
     * Получить размер с компенсацией для retina экранов
     */
    get retinaSize() {
        if (this.upscale) {
            return Number(this.size) * PIXEL_RATIO;
        }
        return Number(this.size);
    }
    /**
     * Метод для поиска анимации
     */
    static getAnimation({ type, animations, }) {
        return animations?.find((animation) => animation.type === type);
    }
    /**
     * Метод для поиска изображений используя старый алгоритм поиска
     */
    findImage() {
        const size = this.retinaSize;
        if (!this.images?.length) {
            return undefined;
        }
        /**
         * Сначала поищем с учетом темы каждого изображения.
         * Если не нашли, вернем самое подходящее по размеру, игнорируя тему.
         */
        return (this.images.find((image) => image.theme === this.theme && (image.height >= size || image.width >= size)) ??
            this.images.find((image) => image.height >= size || image.width >= size) ??
            this.images[this.images.length - 1])?.url;
    }
    /**
     * Новый формат сборки ссылки используя {@link https://confluence.mvk.com/display/IVAS/IVAS%3A+Stickers%3A+Base+URL BaseURL}
     */
    buildBaseUrl() {
        const { config_id } = this.configContext || {};
        const config = this.configs?.find(({ id }) => id === config_id || id === this.defaultConfigId);
        if (!config) {
            return this.findImage();
        }
        const { pattern, sizes, theme_modifiers } = config;
        return pattern.replace(/{([^]+?)}/g, (_, field) => {
            switch (field) {
                case 'image_id':
                    return this.getImageIdModifier();
                case 'size':
                    return this.getSizeModifier(sizes);
                case 'version':
                    return this.getVersionModifier();
                case 'theme_modifier':
                    return this.getCommonModifier(theme_modifiers, this.theme);
                case 'format':
                    return this.getCommonModifier(this.formatModifiers, this.format);
            }
            return '';
        });
    }
    getImageIdModifier() {
        return String(this.imageId);
    }
    getSizeModifier(sizes) {
        const size = this.retinaSize;
        const sizeModifier = sizes.find(({ width, height }) => width >= size || height >= size);
        if (!sizeModifier) {
            return String(size);
        }
        const { modifier, format_modifiers } = sizeModifier;
        this.formatModifiers = format_modifiers;
        return modifier;
    }
    getVersionModifier() {
        const version = this.configContext?.version;
        return version ? String(version) : '';
    }
    getCommonModifier(modifiers, searchId) {
        const modifierPayload = modifiers?.find(({ id }) => id === searchId);
        if (!modifierPayload) {
            return '';
        }
        const { modifier } = modifierPayload;
        return modifier;
    }
}
//# sourceMappingURL=baseUrlBuilder.js.map