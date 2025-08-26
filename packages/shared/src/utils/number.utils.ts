export class NumberUtils {
  static format(num: number, decimals: number = 2): string {
    return num.toFixed(decimals);
  }

  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  }

  static formatPercent(value: number, decimals: number = 1): string {
    return `${(value * 100).toFixed(decimals)}%`;
  }

  static round(num: number, decimals: number = 0): number {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  static random(min: number = 0, max: number = 1): number {
    return Math.random() * (max - min) + min;
  }

  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  static isEven(num: number): boolean {
    return num % 2 === 0;
  }

  static isOdd(num: number): boolean {
    return num % 2 !== 0;
  }

  static isPrime(num: number): boolean {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return true;
  }
}