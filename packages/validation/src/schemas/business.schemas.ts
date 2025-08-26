import { Injectable } from '@nestjs/common';

export interface BusinessRule {
  name: string;
  condition: (data: any) => boolean;
  message: string;
}

@Injectable()
export class BusinessSchemas {
  private rules = new Map<string, BusinessRule>();

  constructor() {
    this.initializeDefaultRules();
  }

  addRule(rule: BusinessRule): void {
    this.rules.set(rule.name, rule);
  }

  getRule(name: string): BusinessRule | undefined {
    return this.rules.get(name);
  }

  getAllRules(): BusinessRule[] {
    return Array.from(this.rules.values());
  }

  validateBusinessRules(data: any, ruleNames: string[]): string[] {
    const errors: string[] = [];
    
    for (const ruleName of ruleNames) {
      const rule = this.rules.get(ruleName);
      if (rule && !rule.condition(data)) {
        errors.push(rule.message);
      }
    }
    
    return errors;
  }

  private initializeDefaultRules(): void {
    this.addRule({
      name: 'uniqueEmail',
      condition: (data) => data.email && !data.emailExists,
      message: 'Email must be unique'
    });

    this.addRule({
      name: 'strongPassword',
      condition: (data) => {
        const password = data.password;
        return password && 
               password.length >= 8 &&
               /[A-Z]/.test(password) &&
               /[a-z]/.test(password) &&
               /\d/.test(password);
      },
      message: 'Password must be at least 8 characters with uppercase, lowercase, and number'
    });

    this.addRule({
      name: 'validAge',
      condition: (data) => data.age >= 18 && data.age <= 120,
      message: 'Age must be between 18 and 120'
    });
  }
}