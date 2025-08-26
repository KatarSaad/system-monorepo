import { Injectable } from '@nestjs/common';
import { NotificationTemplate } from '../interfaces/notification.interface';
import { MetricsService } from '@katarsaad/monitoring';

@Injectable()
export class NotificationTemplateService {
  private templates = new Map<string, NotificationTemplate>();

  constructor(private metrics: MetricsService) {
    this.initializeDefaultTemplates();
  }

  createTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template);
    this.metrics.incrementCounter('notification_template_created', 1);
  }

  getTemplate(id: string): NotificationTemplate | undefined {
    return this.templates.get(id);
  }

  renderTemplate(templateId: string, data: Record<string, any>): { subject?: string; body: string } {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    let renderedBody = template.body;
    let renderedSubject = template.subject;

    // Simple variable replacement
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`;
      renderedBody = renderedBody.replace(new RegExp(placeholder, 'g'), String(value));
      if (renderedSubject) {
        renderedSubject = renderedSubject.replace(new RegExp(placeholder, 'g'), String(value));
      }
    }

    this.metrics.incrementCounter('notification_template_rendered', 1, { templateId });

    return {
      subject: renderedSubject,
      body: renderedBody
    };
  }

  listTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  deleteTemplate(id: string): boolean {
    const deleted = this.templates.delete(id);
    if (deleted) {
      this.metrics.incrementCounter('notification_template_deleted', 1);
    }
    return deleted;
  }

  private initializeDefaultTemplates(): void {
    this.createTemplate({
      id: 'welcome',
      name: 'Welcome Email',
      subject: 'Welcome {{name}}!',
      body: 'Hello {{name}}, welcome to our platform!',
      variables: ['name']
    });

    this.createTemplate({
      id: 'password-reset',
      name: 'Password Reset',
      subject: 'Reset Your Password',
      body: 'Click here to reset your password: {{resetLink}}',
      variables: ['resetLink']
    });
  }
}