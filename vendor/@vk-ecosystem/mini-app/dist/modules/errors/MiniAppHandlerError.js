class MiniAppHandlerError extends Error{constructor(r){super(`${r.error_code}: ${r.error_reason}`);this.error=r;}}

export { MiniAppHandlerError };
