import { PredefinedBackground } from './PredefinedBackground';
import { EVideoEffectType } from '../../constants';
export const WIDTH = 436;
export const HEIGHT = 250;
const BASE_PATH = 'https://st.mycdn.me/static/misc';
const VER_003 = BASE_PATH + '/0-0-3';
const VER_005 = BASE_PATH + '/0-0-5';
/** различные ссылки на CDN */
const Links = {
    /** ссылки на предустановленные фоны */
    backgrounds: [
        {
            id: 3014,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_003 + '/3014-preview.png',
            original: VER_003 + '/3014-original.jpg',
            description: 'flying baloons surrounded by mountains',
            tags: ['default'],
        },
        {
            id: 3016,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_003 + '/3016-preview.png',
            original: VER_003 + '/3016-original.jpg',
            description: 'sauna',
            tags: ['default'],
        },
        {
            id: 3017,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_003 + '/3017-preview.png',
            original: VER_003 + '/3017-original.jpg',
            description: 'red chairs in movie theater',
            tags: ['default'],
        },
        {
            id: 3028,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_003 + '/3028-preview.jpeg',
            original: VER_003 + '/3028-original.jpeg',
            description: 'Dogs in space',
            tags: ['cosmonautics-day-2022'],
        },
        {
            id: 3029,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_003 + '/3029-preview.jpg',
            original: VER_003 + '/3029-original.jpg',
            description: 'Blackboard with e=mc2 formulas',
            tags: ['teachers-day-2022'],
        },
        {
            id: 3031,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_003 + '/3031-preview.png',
            original: VER_003 + '/3031-original.png',
            description: 'vk 2022 mothers day',
            tags: ['vk-2022-mothers-day'],
        },
        {
            id: 3033,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_003 + '/3033-preview.png',
            original: VER_003 + '/3033-original.png',
            description: 'vk 2023 lovers day',
            tags: ['vk-2023-lovers-day'],
        },
        {
            id: 3034,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_003 + '/3034-preview.png',
            original: VER_003 + '/3034-original.png',
            description: 'vk 2023 nft',
            tags: ['default'],
        },
        {
            id: 3036,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_005 + '/3036-preview.jpg',
            original: VER_005 + '/3036-original.jpg',
            description: 'bookshelf',
            tags: ['default'],
        },
        {
            id: 3037,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_005 + '/3037-preview.jpg',
            original: VER_005 + '/3037-original.jpg',
            description: 'VK office 1 with computer tables',
            tags: ['default'],
        },
        {
            id: 3038,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_005 + '/3038-preview.jpg',
            original: VER_005 + '/3038-original.jpg',
            description: 'VK office 2 black reception',
            tags: ['default'],
        },
        {
            id: 3039,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_005 + '/3039-preview.jpg',
            original: VER_005 + '/3039-original.jpg',
            description: 'interior 1 black sofa',
            tags: ['default'],
        },
        {
            id: 3040,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_005 + '/3040-preview.jpg',
            original: VER_005 + '/3040-original.jpg',
            description: 'interior 2 blue sofa yellow pillows',
            tags: ['default'],
        },
        {
            id: 3041,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_005 + '/3041-preview.jpg',
            original: VER_005 + '/3041-original.jpg',
            description: 'interior 3 light room',
            tags: ['default'],
        },
        {
            id: 3042,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_005 + '/3042-preview.jpg',
            original: VER_005 + '/3042-original.jpg',
            description: 'celebration unicorn fun gifts balloons',
            tags: ['default'],
        },
        {
            id: 3043,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_005 + '/3043-preview.jpg',
            original: VER_005 + '/3043-original.jpg',
            description: 'gamer 1 gamer chair',
            tags: ['default'],
        },
        {
            id: 3044,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_005 + '/3044-preview.jpg',
            original: VER_005 + '/3044-original.jpg',
            description: 'gamer 2 cyberpunk command post',
            tags: ['default'],
        },
        {
            id: 3045,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_005 + '/3045-preview.jpg',
            original: VER_005 + '/3045-original.jpg',
            description: 'pattern 1 blue',
            tags: ['default'],
        },
        {
            id: 3046,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_005 + '/3046-preview.jpg',
            original: VER_005 + '/3046-original.jpg',
            description: 'pattern 2 red',
            tags: ['default'],
        },
        {
            id: 3047,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_005 + '/3047-preview.jpg',
            original: VER_005 + '/3047-original.jpg',
            description: 'stickers neutral yellow background',
            tags: ['default'],
        },
        {
            id: 3048,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_005 + '/3048-preview.jpg',
            original: VER_005 + '/3048-original.jpg',
            description: 'stickers love themed hearts background',
            tags: ['default'],
        },
        {
            id: 3049,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_005 + '/3049-preview.jpg',
            original: VER_005 + '/3049-original.jpg',
            description: 'stickers depression raining background',
            tags: ['default'],
        },
        {
            id: 3050,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_005 + '/3050-preview.jpg',
            original: VER_005 + '/3050-original.jpg',
            description: 'night city landscape',
            tags: ['default'],
        },
        {
            id: 3051,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_005 + '/3051-preview.jpg',
            original: VER_005 + '/3051-original.jpg',
            description: 'stickers 3D',
            tags: ['default'],
        },
        {
            id: 3052,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_005 + '/3052-preview.jpg',
            original: VER_005 + '/3052-original.jpg',
            description: 'anime japanese city',
            tags: ['default'],
        },
        {
            id: 3053,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_005 + '/3053-preview.jpg',
            original: VER_005 + '/3053-original.jpg',
            description: 'anime sakura garden',
            tags: ['default'],
        },
        {
            id: 3054,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_005 + '/3054-preview.jpg',
            original: VER_005 + '/3054-original.jpg',
            description: 'anime traditional japanese house',
            tags: ['default'],
        },
        {
            id: 3055,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_005 + '/3055-preview.jpg',
            original: VER_005 + '/3055-original.jpg',
            description: 'snowy coastline',
            tags: ['default'],
        },
        {
            id: 3056,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_005 + '/3056-preview.jpg',
            original: VER_005 + '/3056-original.jpg',
            description: 'sunflowers field with a sunset',
            tags: ['default'],
        },
        {
            id: 3057,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_005 + '/3057-preview.jpg',
            original: VER_005 + '/3057-original.jpg',
            description: 'forest lake',
            tags: ['default'],
        },
        {
            id: 3058,
            type: EVideoEffectType.BACKGROUND,
            preview: VER_005 + '/3058-preview.jpg',
            original: VER_005 + '/3058-original.jpg',
            description: 'vk 17 years anniversary dog balloons and cakes',
            tags: ['default'],
        },
    ],
    icons: {
        starBackground: {
            id: 'icon-star-background',
            description: 'Icon for indicating that virtual background is from stars',
            url: VER_003 + '/icon-star-background.svg',
            type: 'svg',
        },
    },
};
/** список заранее загруженных статичных виртуальных фонов */
export const predefinedBackgrounds = (() => {
    /** порядок фонов, указанный в фигме (id смотреть в calls-video-effects) */
    const backgroundOrder = [
        // Background
        3058, 3055, 3056, 3057, 3052, 3053, 3054, 3036, 3037, 3038, 3039, 3040, 3041, 3042, 3043, 3044, 3045,
        3046, 3047, 3048, 3049, 3050, 3051, 3034, 3033, 3031, 3029, 3028, 3016, 3014, 3017,
    ];
    const mapped = new Map();
    backgroundOrder.forEach((id) => mapped.set(id, null));
    for (const background of Links.backgrounds) {
        if (mapped.has(background.id)) {
            mapped.set(background.id, new PredefinedBackground(background));
        }
    }
    const backgrounds = [...mapped.values()].filter(Boolean);
    return backgrounds;
})();
//# sourceMappingURL=constants.js.map