import * as Achievement from '../../core/model/Achievement';
export function fromApiAchievements(apiAchievements) {
    if (!apiAchievements || apiAchievements.length === 0) {
        return [];
    }
    return apiAchievements.map((x) => ({
        id: Achievement.resolveAchievementId(x.achievement_id),
        logo: x.logo && x.logo[0] ? x.logo[0].url : '',
        title: x.achievement_title,
    }));
}
//# sourceMappingURL=AchievementConverter.js.map