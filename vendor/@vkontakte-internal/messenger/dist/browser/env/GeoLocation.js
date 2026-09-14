export class GeoLocation {
    get() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition((position) => resolve([position.coords.latitude, position.coords.longitude]), reject);
        });
    }
    /**
     * Освободить ресурсы
     */
    dispose() {
        // пока здесь нечего подчищать
    }
}
//# sourceMappingURL=GeoLocation.js.map