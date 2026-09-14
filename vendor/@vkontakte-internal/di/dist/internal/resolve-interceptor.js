class ResolveInterceptor {
    constructor() {
        this.interceptors = new Set();
        this.run = (data) => this.interceptors.forEach((cb) => cb(data));
        this.apply = (interceptor) => {
            this.interceptors.add(interceptor);
            return () => this.interceptors.delete(interceptor);
        };
    }
}
export const resolveInterceptor = new ResolveInterceptor();
//# sourceMappingURL=resolve-interceptor.js.map