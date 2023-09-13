export class AsyncQueue<T> {
  private items: T[] = [];
  private resolves: ((value: T | PromiseLike<T>) => void)[] = [];

  async put(item: T) {
    if (this.resolves.length > 0) {
      const nextResolve = this.resolves.shift();
      nextResolve?.(item);
    } else {
      this.items.push(item);
    }
  }

  async get(): Promise<T> {
    if (this.items.length > 0) {
      return Promise.resolve(this.items.shift() as T);
    } else {
      return new Promise<T>((resolve) => this.resolves.push(resolve));
    }
  }

  size(): number {
    return this.items.length;
  }
}
