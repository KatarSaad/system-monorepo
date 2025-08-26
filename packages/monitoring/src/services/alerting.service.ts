import { Injectable } from '@nestjs/common';

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  threshold: number;
  operator: 'gt' | 'lt' | 'eq';
  enabled: boolean;
}

export interface Alert {
  id: string;
  ruleId: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  resolved: boolean;
}

@Injectable()
export class AlertingService {
  private rules = new Map<string, AlertRule>();
  private alerts = new Map<string, Alert>();

  addRule(rule: Omit<AlertRule, 'id'>): string {
    const id = this.generateId();
    this.rules.set(id, { ...rule, id });
    return id;
  }

  removeRule(id: string): boolean {
    return this.rules.delete(id);
  }

  checkMetric(metric: string, value: number): Alert[] {
    const triggeredAlerts: Alert[] = [];
    
    for (const rule of this.rules.values()) {
      if (!rule.enabled || rule.metric !== metric) continue;
      
      let triggered = false;
      switch (rule.operator) {
        case 'gt': triggered = value > rule.threshold; break;
        case 'lt': triggered = value < rule.threshold; break;
        case 'eq': triggered = value === rule.threshold; break;
      }
      
      if (triggered) {
        const alert: Alert = {
          id: this.generateId(),
          ruleId: rule.id,
          message: `${rule.name}: ${metric} is ${value} (threshold: ${rule.threshold})`,
          severity: this.getSeverity(value, rule.threshold),
          timestamp: new Date(),
          resolved: false
        };
        
        this.alerts.set(alert.id, alert);
        triggeredAlerts.push(alert);
      }
    }
    
    return triggeredAlerts;
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }

  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved);
  }

  private getSeverity(value: number, threshold: number): Alert['severity'] {
    const ratio = Math.abs(value - threshold) / threshold;
    if (ratio > 0.5) return 'critical';
    if (ratio > 0.3) return 'high';
    if (ratio > 0.1) return 'medium';
    return 'low';
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}