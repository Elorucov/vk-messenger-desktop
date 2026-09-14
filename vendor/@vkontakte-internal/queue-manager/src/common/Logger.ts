export class Logger {
  public constructor(
    public enabled: boolean,
    private readonly prefix = '',
  ) {}

  private createMessage(args: unknown[]) {
    if (!this.prefix) {
      return args;
    }

    return args.map((el, idx) => {
      if (idx === 0 && typeof el === 'string') {
        return `[${this.prefix}] ${el}`;
      }
      return el;
    });
  }

  public debug(...args: unknown[]) {
    if (this.enabled) console.debug(...this.createMessage(args));
  }

  public log(...args: unknown[]) {
    if (this.enabled) console.log(...this.createMessage(args));
  }

  public warn(...args: unknown[]) {
    if (this.enabled) console.warn(...this.createMessage(args));
  }

  public error(...args: unknown[]) {
    if (this.enabled) console.error(...this.createMessage(args));
  }
}
