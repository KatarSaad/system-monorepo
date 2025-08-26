export class ArrayUtils {
  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  static unique<T>(array: T[]): T[] {
    return [...new Set(array)];
  }

  static uniqueBy<T>(array: T[], key: keyof T): T[] {
    const seen = new Set<unknown>();
    return array.filter((item) => {
      const value = item[key] as unknown;
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }

  static groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  static sortBy<T>(
    array: T[],
    key: keyof T,
    direction: "asc" | "desc" = "asc"
  ): T[] {
    return [...array].sort((a, b) => {
      const aVal = a[key] as unknown as number | string;
      const bVal = b[key] as unknown as number | string;

      if (aVal < bVal) return direction === "asc" ? -1 : 1;
      if (aVal > bVal) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  static flatten<T>(array: Array<T | T[]>): T[] {
    return array.reduce<T[]>((flat, item) => {
      if (Array.isArray(item)) {
        flat.push(...this.flatten(item));
      } else {
        flat.push(item);
      }
      return flat;
    }, []);
  }

  static intersection<T>(array1: T[], array2: T[]): T[] {
    return array1.filter((item) => array2.includes(item));
  }

  static difference<T>(array1: T[], array2: T[]): T[] {
    return array1.filter((item) => !array2.includes(item));
  }

  static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  static sample<T>(array: T[], count: number = 1): T[] {
    const shuffled = this.shuffle(array);
    return shuffled.slice(0, count);
  }

  static partition<T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] {
    const truthy: T[] = [];
    const falsy: T[] = [];

    array.forEach((item) => {
      if (predicate(item)) {
        truthy.push(item);
      } else {
        falsy.push(item);
      }
    });

    return [truthy, falsy];
  }
}
