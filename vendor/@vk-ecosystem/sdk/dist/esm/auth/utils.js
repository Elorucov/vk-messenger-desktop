function makeInitStatsInfo(entry) {
    if (entry) {
        return btoa(JSON.stringify(entry));
    }
    return '';
}

export { makeInitStatsInfo };
