export class ObjectUtils {
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") return obj as T;
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
    if (obj instanceof Array)
      return obj.map((item) => this.deepClone(item)) as unknown as T;

    const cloned = {} as T;
    for (const key in obj as any) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        (cloned as any)[key] = this.deepClone((obj as any)[key]);
      }
    }
    return cloned;
  }

  static deepMerge<T extends Record<string, any>>(
    target: T,
    ...sources: Partial<T>[]
  ): T {
    if (!sources.length) return target;
    const currentSource = sources.shift();
    if (!currentSource) return target;

    if (this.isObject(target) && this.isObject(currentSource)) {
      for (const key in currentSource) {
        const sourceValue = (currentSource as any)[key];
        if (this.isObject(sourceValue)) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.deepMerge(target[key] as any, sourceValue);
        } else {
          Object.assign(target, { [key]: sourceValue });
        }
      }
    }

    return this.deepMerge(target, ...sources);
  }

  static pick<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach((key) => {
      if (key in obj) {
        (result as any)[key] = obj[key];
      }
    });
    return result;
  }

  static omit<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Omit<T, K> {
    const result = { ...obj } as any;
    keys.forEach((key) => {
      delete result[key];
    });
    return result as Omit<T, K>;
  }

  static isEmpty(obj: any): boolean {
    if (obj == null) return true;
    if (Array.isArray(obj) || typeof obj === "string") return obj.length === 0;
    if (obj instanceof Map || obj instanceof Set) return obj.size === 0;
    return Object.keys(obj).length === 0;
  }

  static isObject(item: any): boolean {
    return item && typeof item === "object" && !Array.isArray(item);
  }

  static flatten(
    obj: Record<string, any>,
    prefix: string = ""
  ): Record<string, any> {
    const flattened: Record<string, any> = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (this.isObject(obj[key]) && !Array.isArray(obj[key])) {
          Object.assign(flattened, this.flatten(obj[key], newKey));
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }

    return flattened;
  }

  static unflatten(obj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};

    for (const key in obj) {
      const keys = key.split(".");
      let current: any = result;

      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!(k in current)) {
          current[k] = {};
        }
        current = current[k];
      }

      current[keys[keys.length - 1]] = obj[key];
    }

    return result;
  }

  static getNestedValue(obj: any, path: string): any {
    return path
      .split(".")
      .reduce((current, key) => (current as any)?.[key], obj);
  }

  static setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split(".");
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!(key in (current as any))) {
        (current as any)[key] = {};
      }
      return (current as any)[key];
    }, obj as any);

    target[lastKey] = value;
  }

  static removeUndefined<T extends Record<string, any>>(obj: T): T {
    const cleaned = {} as T;

    for (const key in obj) {
      if ((obj as any)[key] !== undefined) {
        if (this.isObject((obj as any)[key])) {
          (cleaned as any)[key] = this.removeUndefined((obj as any)[key]);
        } else {
          (cleaned as any)[key] = (obj as any)[key];
        }
      }
    }

    return cleaned;
  }

  static compareObjects(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }
}
