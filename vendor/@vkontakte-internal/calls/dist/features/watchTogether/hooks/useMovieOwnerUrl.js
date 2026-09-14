export const useMovieOwnerUrl = (group, profile) => {
    if (group) {
        return group.screen_name ? `/${group.screen_name}` : `/public${group.id}`;
    }
    if (profile) {
        return profile.screen_name ? `/${profile.screen_name}` : `/id${profile.id}`;
    }
    return null;
};
//# sourceMappingURL=useMovieOwnerUrl.js.map