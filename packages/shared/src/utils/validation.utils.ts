export class ValidationUtils {
  static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  static readonly PHONE_REGEX = /^\+?[\d\s\-\(\)]+$/;
  static readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  static readonly URL_REGEX = /^https?:\/\/.+/;

  static isEmail(value: string): boolean {
    return this.EMAIL_REGEX.test(value);
  }

  static isPhone(value: string): boolean {
    return this.PHONE_REGEX.test(value);
  }

  static isUUID(value: string): boolean {
    return this.UUID_REGEX.test(value);
  }

  static isUrl(value: string): boolean {
    return this.URL_REGEX.test(value);
  }

  static isStrongPassword(password: string): boolean {
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /\d/.test(password) &&
           /[!@#$%^&*]/.test(password);
  }

  static sanitizeString(value: string): string {
    return value.replace(/[<>]/g, '').trim();
  }
}