export class StringUtils {
  static isEmpty(str: string | null | undefined): boolean {
    return !str || str.trim().length === 0;
  }

  static isNotEmpty(str: string | null | undefined): boolean {
    return !this.isEmpty(str);
  }

  static toCamelCase(str: string): string {
    return str.replace(/([-_][a-z])/gi, (match) => 
      match.toUpperCase().replace('-', '').replace('_', '')
    );
  }

  static toPascalCase(str: string): string {
    const camelCase = this.toCamelCase(str);
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
  }

  static toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  static toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }

  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  static truncate(str: string, length: number, suffix: string = '...'): string {
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
  }

  static slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static mask(str: string, visibleChars: number = 4, maskChar: string = '*'): string {
    if (str.length <= visibleChars) return str;
    const visible = str.slice(-visibleChars);
    const masked = maskChar.repeat(str.length - visibleChars);
    return masked + visible;
  }

  static generateRandomString(length: number, charset?: string): string {
    const defaultCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const chars = charset || defaultCharset;
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  static isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static extractNumbers(str: string): number[] {
    const matches = str.match(/\d+/g);
    return matches ? matches.map(Number) : [];
  }

  static removeHtml(str: string): string {
    return str.replace(/<[^>]*>/g, '');
  }

  static escapeHtml(str: string): string {
    const htmlEscapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    
    return str.replace(/[&<>"']/g, (match) => htmlEscapes[match]);
  }
}