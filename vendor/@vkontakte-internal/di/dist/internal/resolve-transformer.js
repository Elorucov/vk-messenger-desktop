class ResolveTransformer {
    constructor() {
        this.transforms = new Map();
        this.run = (target, args) => {
            const transformsSet = this.transforms.get(target);
            if (transformsSet) {
                transformsSet.forEach((cb) => cb(args));
            }
        };
        this.apply = (target, transform) => {
            const transformsSet = this.transforms.get(target) ?? new Set();
            transformsSet.add(transform);
            this.transforms.set(target, transformsSet);
            return () => transformsSet.delete(transform);
        };
    }
}
export const resolveTransformer = new ResolveTransformer();
//# sourceMappingURL=resolve-transformer.js.map