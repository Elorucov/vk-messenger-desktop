/**
 * Asserts the `value` type is `never`, i.e. this function should never be called.
 * If it is called at runtime, it will throw a `TypeError`. The return type is
 * `never` to support returning in exhaustive type checks.
 *
 * ```ts
 * return expectNever(value);
 * ```
 */
export const expectNever = (value) => {
    throw new TypeError(`Unexpected value: ${value}`);
};
//# sourceMappingURL=expect.js.map