export class Guard {
  static againstNullOrUndefined(value: any, argumentName: string): void {
    if (value === null || value === undefined) {
      throw new Error(`${argumentName} is null or undefined`);
    }
  }

  static againstNullOrUndefinedBulk(args: Array<{ argument: any; argumentName: string }>): void {
    for (const arg of args) {
      this.againstNullOrUndefined(arg.argument, arg.argumentName);
    }
  }

  static isOneOf(value: any, validValues: any[], argumentName: string): void {
    if (!validValues.includes(value)) {
      throw new Error(`${argumentName} must be one of: ${validValues.join(', ')}`);
    }
  }

  static againstAtLeast(numChars: number, text: string, argumentName: string): void {
    if (text.length < numChars) {
      throw new Error(`${argumentName} must be at least ${numChars} characters`);
    }
  }

  static againstAtMost(numChars: number, text: string, argumentName: string): void {
    if (text.length > numChars) {
      throw new Error(`${argumentName} must be at most ${numChars} characters`);
    }
  }

  static againstEmpty(text: string, argumentName: string): void {
    if (text.trim().length === 0) {
      throw new Error(`${argumentName} cannot be empty`);
    }
  }
}